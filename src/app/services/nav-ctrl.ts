import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { rutasModel } from '../utils/diccionario-rutas';

@Injectable({
  providedIn: 'root'
})
export class NavCtrl {

  rutas = rutasModel();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) {
  }

  public historialRutas: Array<any> = [this.rutas['HomePage']];
  public historialPaginas: Array<any> = ['HomePage'];
  public paginaActual: string = "HomePage";
  public paginaActualVieneDesdeElMenu: boolean = false;

  public sesionIniciada: boolean = false;

  getParams() {
    return new Promise<any>((resolve, reject) => {
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation()?.extras.state) {
          resolve(this.router.getCurrentNavigation()?.extras.state);
        }
      });
    });
  }

  setRoot(pagina: string, parametros?:any) {
    return new Promise<void>((resolve, reject) => {
      console.log("setRoot!", this.rutas[pagina], pagina);
      if (!this.rutas[pagina]) {
        return reject("No existe la pagina " + pagina + " en el diccionario de paginas.");
      }
      this.historialRutas = [];
      this.historialPaginas = [];
      this.historialRutas.push(this.rutas[pagina]);
      this.historialPaginas.push(pagina);
      setTimeout(() => {
        this.router.navigate(
          [
            this.rutas[pagina]
          ]
          ,
          {
            replaceUrl: true,
            state: parametros,
          });
        // this.router.navigate(
        //   [
        //     rutas[pagina]
        //   ],
        //   {
        //     relativeTo: this.route,
        //     skipLocationChange:true,
        //     state: parametros,
        //   });

        this.paginaActual = pagina;
        resolve();
      });
    });
  }

  getIdFromUrl(url: string): string | null {
    const match = url.match(/;id=(\d+)/);
    return match ? match[1] : null;
  }
  setRootMenu(pagina: string, parametros?:any) {
    return new Promise<void>((resolve, reject) => {
      let currentId = this.getIdFromUrl(this.router.url);
      let setId= ((currentId===null)?0:(parseInt(currentId)+1));
      localStorage.setItem('setMenu', '1');
      if (!this.rutas[pagina]) {
        return reject("No existe la pagina " + pagina + " en el diccionario de paginas.");
      }
      this.historialRutas = [];
      this.historialPaginas = [];
      this.historialRutas.push(this.rutas[pagina]);
      this.historialPaginas.push(pagina);

      setTimeout(() => {
        this.router.navigate(
          [
            this.rutas[pagina],
            {'id':setId}
          ]
          ,
          {
            replaceUrl: true,
            state: parametros,
          });

        this.paginaActual = pagina;
        resolve();
      });

    });
  }

  goBackTo(pagina: string, parametros?:any) {
    return new Promise<void>((resolve, reject) => {
      console.log("goBackTo!", this.rutas[pagina], pagina);
      if (!this.rutas[pagina]) {
        throw new Error(`No existe la página "${pagina}" en el diccionario de rutas.`);
      }
      const nuevasRutas = [];
      const nuevasPaginas = [];

      for (const res of this.historialPaginas) {
        if (res === pagina) {
          break;
        }
        nuevasRutas.push(this.rutas[res]);
        nuevasPaginas.push(res);
      }

      this.historialRutas = nuevasRutas;
      this.historialPaginas = nuevasPaginas;
      this.historialRutas.push(this.rutas[pagina]);
      this.historialPaginas.push(pagina);

      setTimeout(() => {
        this.router.navigate(
          [
            this.rutas[pagina]
          ]
          ,
          {
            replaceUrl: true,
            state: parametros,
          });
        this.paginaActual = pagina;
        resolve();
      });
    });
  }

  goToHomeOrLogin() {
    console.log("POP: IR A HOME?");
    if (this.paginaActual !== 'HomePage' && this.paginaActualVieneDesdeElMenu) {
      console.log("POP: IR A HOME!");
      this.setRoot('HomePage');
      this.paginaActualVieneDesdeElMenu = false;
      return;
    }
  }

  goToHomeFinProces() {
    if (this.paginaActual !== 'HomePage' ) {
      localStorage.removeItem('setMenu');
      this.setRoot('HomePage');
      return;
    }
  }

  push(pagina: string, parametros?:any) {
    return new Promise<void>(async (resolve, reject) => {

      if (!this.rutas[pagina]) {
        return reject("No existe la pagina " + pagina + " en el diccionario de paginas.")
      }
      this.historialRutas.push(this.rutas[pagina]); //this.historial.push(pagina);
      this.historialPaginas.push(pagina);

      this.router.navigate(
        [
          this.rutas[pagina]
        ],
        {
          state: parametros
        });
      this.paginaActual = pagina;
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  pushMenu(pagina: string, parametros?:any) {
    return new Promise<void>(async (resolve, reject) => {
      let currentId = this.getIdFromUrl(this.router.url);
      let setId= ((currentId===null)?0:(parseInt(currentId)+1));
      localStorage.setItem('setMenu', '1');
      if (!this.rutas[pagina]) {
        return reject("No existe la pagina " + pagina + " en el diccionario de paginas.")
      }
      this.historialRutas.push(this.rutas[pagina]); //this.historial.push(pagina);
      this.historialPaginas.push(pagina);

      this.router.navigate(
        [
          this.rutas[pagina],
          {'id':setId}
        ],
        {
          state: parametros
        });
      this.paginaActual = pagina;
      setTimeout(() => {
        resolve();
      }, 200);
    });
  }

  popToRoot() {
    return new Promise<void>((resolve, reject) => {
      // if (this.historialRutas.length === 1) {
      //   this.goToHomeOrLogin();
      //   resolve();
      //   return;
      // }
      this.historialRutas = [this.historialRutas[0]];
      this.historialPaginas = [this.historialPaginas[0]];
      setTimeout(() => {
        this.router.navigate(
          [
            this.historialRutas[0]
          ],
          {
            replaceUrl: true
          });
        this.paginaActual = this.historialPaginas[0];
        resolve();
      });
    });
  }

  pop() {
    return new Promise<void>((resolve, reject) => {
      console.log("Pop!");
      if (this.historialRutas.length > 1) {
        this.historialRutas.pop();
        this.historialPaginas.pop()
        setTimeout(() => {
          this.router.navigate(
            [
              this.historialRutas[this.historialRutas.length - 1]
            ],
            {
              replaceUrl: true
            });
          this.paginaActual = this.historialPaginas[this.historialPaginas.length - 1]
          resolve();
        });
      } else {
        this.goToHomeOrLogin();
        resolve();
      }

    });
  }

  canGoBack(): boolean {
    // console.log("historial.length: ", this.historial.length, this.historial)
    if (this.historialRutas.length > 1) {
      return true;
    }
    return false;
  }

  first(): any {
    return this.historialRutas[this.historialRutas.length - 1];
  }

  last(): any {
    return this.historialRutas[0];
  }

  getRouterUrl(): string {
    let routerPage = this.router.url.replace('/', '');
    return routerPage;
  }

  getHistorial(): Array<any> {
    return this.historialRutas;
  }

  getActive(): any {
    return {
      component: {
        name: this.historialRutas[this.historialRutas.length - 1]
      }
    }
  }

  resetHistorial(): any {
    this.historialRutas = [];
    this.historialPaginas = [];
  }

  removeView(): any {
    console.error('Pendiente de implementar removeView()?');
    this.historialRutas.pop();
    this.historialPaginas.pop();
  }

/**
 *
 * @param historialRutas - Arreglo con el historial de rutas descritas en: import { rutas } from 'src/models/diccionario-rutas/diccionarioRutas';
 *
 * @param historialPaginas - Arreglo con el historial paginas (nombres de las clases de los componentes)
 *
 *
 */
  setHistorial(historialRutas: Array<any>, historialPaginas: Array<any>) {
    this.historialRutas = historialRutas;
    this.historialPaginas = historialPaginas;
  }
}

