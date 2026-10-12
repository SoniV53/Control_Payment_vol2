import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, OnDestroy, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonSpinner } from '@ionic/angular/standalone';
import Swal from 'sweetalert2';
import { EmptyStateComponent } from 'src/app/component/empty-state/empty-state.component';

@Component({
  selector: 'app-modal-detalle-cuotas',
  templateUrl: './modal-detalle-cuotas.component.html',
  styleUrls: ['./modal-detalle-cuotas.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, EmptyStateComponent, IonSpinner],
  encapsulation: ViewEncapsulation.None,
})
export class ModalDetalleCuotasComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() gastoSeleccionado: any = null;
  @Input() detalleCuotas: any[] = [];

  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() confirmarToggle = new EventEmitter<{cuota: any, nuevoEstado: number}>();

  // Scroll inteligente / Paginación progresiva
  limiteActual: number = 10;
  cuotasPaginadas: any[] = [];
  cargandoMas: boolean = false;
  private observer?: IntersectionObserver;

  @ViewChild('infiniteSentinel') set sentinelElement(el: ElementRef | undefined) {
    if (el && el.nativeElement) {
      this.initObserver(el.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['detalleCuotas'] || changes['isOpen']) {
      this.limiteActual = 10;
      this.actualizarCuotasPaginadas();
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  actualizarCuotasPaginadas() {
    this.cuotasPaginadas = (this.detalleCuotas || []).slice(0, this.limiteActual);
  }

  initObserver(el: HTMLElement) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first && first.isIntersecting && !this.cargandoMas) {
        if (this.cuotasPaginadas.length < this.detalleCuotas.length) {
          this.ejecutarCarga();
        }
      }
    }, {
      root: null,
      rootMargin: '120px',
      threshold: 0.1
    });

    this.observer.observe(el);
  }

  ejecutarCarga() {
    this.cargandoMas = true;
    setTimeout(() => {
      this.limiteActual += 10;
      this.actualizarCuotasPaginadas();
      this.cargandoMas = false;
    }, 600);
  }

  cerrarModal() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  async togglePagoCuota(c: any, e: any) {
    const isChecked = e.detail.checked;
    const nuevoEstado = isChecked ? 1 : 0;
    
    // Si el estado en el objeto ya es igual al que intentamos poner, ignorar (evita loop infinito si forzamos rollback)
    if (c.estado_cuota === nuevoEstado) return;

    const accion = nuevoEstado === 1 ? 'marcar como pagada' : 'desmarcar';

    const result = await Swal.fire({
      title: 'Confirmar',
      text: `¿Deseas ${accion} la Cuota #${c.numero_cuota}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3880ff',
      cancelButtonColor: '#ff4961',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      heightAuto: false, // previene bugs visuales de SweetAlert en Ionic
      backdrop: true,
    });

    if (result.isConfirmed) {
      // El padre se encarga de la llamada API y de actualizar c.estado_cuota
      this.confirmarToggle.emit({ cuota: c, nuevoEstado });
    } else {
      // Revertir el componente visualmente porque el usuario canceló
      e.target.checked = c.estado_cuota === 1;
    }
  }
}

