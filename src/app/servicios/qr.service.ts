import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { BehaviorSubject } from 'rxjs';
export interface DocumentoData {
  numero: string;
  apellido: string;
  nombre: string
}
@Injectable({
  providedIn: 'root'
})


export class QrService {

  scan : boolean = false;
  scanResult : any = "";

  private datosEscaneadosSubject = new BehaviorSubject<DocumentoData | null>(null);
  datosEscaneados$ = this.datosEscaneadosSubject.asObservable();

    // NUEVA FUNCIÓN: Sujeto para emitir cualquier resultado de escaneo (incluyendo las mesas)
  private qrContentScannedSubject = new BehaviorSubject<string | null>(null);
  // NUEVA FUNCIÓN: Observable para que otros componentes puedan suscribirse a los resultados de QR.
  qrContentScanned$ = this.qrContentScannedSubject.asObservable();

  constructor(private router: Router) { }

  async CheckPermission()
  {
    try{
      
      const status = await BarcodeScanner.checkPermission({force:true});
      if(status.granted)
      {
        return true;
      }
      
      return false;
    }
    catch(e)
    {
      return undefined;
    }

  }

  async StartScan()
  {
    
    if(!this.scan)
    {
      this.scan = true;
      try
      {
        const permission = await this.CheckPermission();
        if(!permission) 
        {
          this.scan = false;
          this.scanResult = "Error. No hay permisos";
        }
        else
        {
          await BarcodeScanner.hideBackground();
          document.querySelector('body')?.classList.add('scanner-active');
          const result = await BarcodeScanner.startScan();
          BarcodeScanner.showBackground();
          document.querySelector('body')?.classList.remove('scanner-active');
          this.scan = false;
          if(result?.hasContent)
          {
            this.scanResult = result.content;

            const documento = await this.devolverDocumento();
            if (documento) {
              this.datosEscaneadosSubject.next(documento);
            }
          }
        }
      }
      catch(e)
      {
        console.log(e);
      }
    }
    else
    {
      this.StopScan();
    }

  }

  StopScan()
  {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.scan = false;
    this.scanResult = "";
  }

  async devolverDocumento(): Promise<DocumentoData | null> {
    if (!this.scanResult) {
      return null;
    }

    const campos = this.scanResult.split('@');


    if (campos.length < 5) {
      console.error('Formato de escaneo desconocido', this.scanResult);
      return null;
    }

    const numero = campos[4] || '';
    let apellido = (campos[1] || '').replace(/NXX/gi, 'ñ');
    apellido = this.capitalizeFirstLetter(apellido);
    const nombreCompleto = (campos[2] || '').replace(/XX/g, 'ñ');
    let nombre = this.capitalizeFirstLetter(nombreCompleto.split(' ')[0]);

    const documento: DocumentoData = {
      numero,
      apellido,
      nombre,
    };
    return documento;
  }

  capitalizeFirstLetter(text: string): string {
  if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }


  async StartScanYRedireccionar() {
    if (this.scan) return;

    this.scan = true;

    try {
      const permission = await this.CheckPermission();
      if (!permission) {
        this.scan = false;
        this.scanResult = 'Error. No hay permisos';
        return;
      }

      await BarcodeScanner.hideBackground();
      document.querySelector('body')?.classList.add('scanner-active');

      const result = await BarcodeScanner.startScan();

      BarcodeScanner.showBackground();
      document.querySelector('body')?.classList.remove('scanner-active');
      this.scan = false;

      if (result?.hasContent) {
        this.scanResult = result.content;
        // NUEVA LÍNEA: Emite el contenido escaneado a través del nuevo BehaviorSubject
        this.qrContentScannedSubject.next(this.scanResult);

        // Ya no necesitas la lógica de redirección aquí para 'home-cliente', 'home-admin', etc.
        // Esa lógica la manejará el componente que se suscribe (HomeClientePage).
        // Si necesitas que este método también maneje otras redirecciones que no sean de mesas,
        // puedes mantenerlas aquí, pero la lógica de mesas la haremos en el componente.
        const rutasValidasIniciales = ['home-admin', 'home-empleado']; // Excluye 'home-cliente' de esta parte
        if (rutasValidasIniciales.includes(this.scanResult)) {
          this.router.navigate(['/' + this.scanResult]);
        } else {
           // Si no es una ruta de admin/empleado, o una mesa (que será manejada en el componente),
           // simplemente loguea el contenido o haz algo más por defecto.
          console.log('Contenido escaneado emitido para procesamiento externo:', this.scanResult);
        }
      }
    } catch (e) {
      console.error('Error durante escaneo y emisión de resultado', e);
      this.scan = false;
    }
  }

}
