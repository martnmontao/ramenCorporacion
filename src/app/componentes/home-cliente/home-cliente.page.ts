import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { QrService } from 'src/app/servicios/qr.service';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  standalone: false,
})
export class HomeClientePage implements OnInit {
  mostrarOpciones = false;
  verificarCliente = false;
  user: any;
  verificarQr = false; // Puedes usar esta bandera si necesitas para la UI

  // NUEVA FUNCIÓN: Propiedad para almacenar la suscripción y poder desuscribirse.
  private qrScanSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    // NUEVA FUNCIÓN: Inyecta el QrService
    private qrService: QrService
  ) { }

  async ngOnInit() {
    this.user = await this.firebaseService.obtenerUsuarioLogueado();
    await this.verificarClienteEnMesa();

    // NUEVA FUNCIÓN: Suscribirse a los resultados de escaneo del QrService
    this.qrScanSubscription = this.qrService.qrContentScanned$.subscribe(qrContent => {
      if (qrContent) {
        this.handleQrScanResult(qrContent);
      }
    });
  }

  // NUEVA FUNCIÓN: Implementa ngOnDestroy para limpiar la suscripción
  ngOnDestroy(): void {
    if (this.qrScanSubscription) {
      this.qrScanSubscription.unsubscribe();
    }
  }

  irA(path: string) {
    this.router.navigateByUrl(path);
  }

  mostrarContenedores(contenedor: string) {
    switch (contenedor) {
      case "opciones":
        this.mostrarOpciones = !this.mostrarOpciones;
        break;
      // ... otros casos
    }
  }

  cerrarSesion() {
    this.firebaseService.cerrarSesion();
  }

  async verificarClienteEnMesa() {
    const tieneMesa = await this.firebaseService.obtenerMesaPorUidUsuario(this.user.uid);
    if (tieneMesa != null) {
      this.verificarCliente = true;
      // Si necesitas comparar el QR de la mesa asignada con el escaneado, lo harías aquí
      // o en 'handleQrScanResult' si 'tieneMesa' contiene el QR de la mesa.
      // Por ejemplo, si 'tieneMesa' es un objeto con una propiedad 'qrCode':
      // if (tieneMesa.qrCode === 'tu_qr_escaneado_actual') { this.verificarQr = true; }
    }
  }

  // NUEVA FUNCIÓN: Método para iniciar el escaneo desde HomeClientePage (e.g., al hacer clic en un botón)
  async iniciarEscaneoQR() {
    await this.qrService.StartScanYRedireccionar();
  }

  // NUEVA FUNCIÓN: Método para manejar el resultado del escaneo y la redirección
  private handleQrScanResult(qrContent: string) {
    const validTables = ['mesa1', 'mesa2', 'mesa3', 'mesa4'];

    if (validTables.includes(qrContent.toLowerCase())) {
      if (this.verificarCliente) {
        // Si el cliente tiene una mesa asignada (verificarCliente es true),
        // y escanea un QR de mesa, redirige a las rutas del menú.
        console.log(`Cliente con mesa escaneó ${qrContent}. Redirigiendo a opciones de mesa.`);
        // Aquí puedes redirigir a una ruta por defecto o mostrar un menú de opciones.
        // Por ejemplo, redirigir a la página de productos:
        this.router.navigate(['/productos']); // O la ruta que prefieras como inicio de menú
      } else {
        // Si el cliente NO tiene una mesa asignada (verificarCliente es false),
        // y escanea un QR de mesa, redirige a home-cliente para que se asigne a la mesa.
        console.log(`Cliente sin mesa escaneó ${qrContent}. Redirigiendo a home-cliente para asignación.`);
        this.router.navigate(['/home-cliente']); // Comportamiento original
      }
    } else {
      // Aquí puedes manejar otros tipos de QR que no sean de mesa,
      // o QRs que no necesiten una lógica especial para clientes con/sin mesa.
      console.log('Contenido QR no reconocido como mesa o ya manejado por otra lógica:', qrContent);
      // Opcional: Si el QR es una ruta válida como 'chat-mozo', 'productos', etc.,
      // y el cliente tiene mesa, podrías redirigirlo directamente.
      const validMenuPaths = ['chat-mozo', 'productos', 'juegos', 'encuestas', 'lista-pedidos'];
      if (this.verificarCliente && validMenuPaths.includes(qrContent.toLowerCase())) {
          console.log(`Cliente con mesa escaneó una ruta de menú: ${qrContent}. Redirigiendo.`);
          this.router.navigate(['/' + qrContent.toLowerCase()]);
      }
    }
  }




}
