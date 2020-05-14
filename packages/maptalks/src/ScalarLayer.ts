// @ts-ignore
import { CanvasLayer, renderer, Coordinate, Point } from 'maptalks/dist/maptalks.es.js';
import { assign, formatData, IOptions, isArray, ScalarField } from 'wind-core';
import { containsCoordinate, Extent, transformExtent } from './utils';

const _options = {
  renderer: 'canvas',
  doubleBuffer: false,
  animation: false,
};

export class ScalarLayerRenderer extends renderer.CanvasLayerRenderer {
  public scalarRender: ScalarField;
  private _drawContext: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement | undefined;
  public layer: any;
  public context: CanvasRenderingContext2D;

  checkResources() {
    return [];
  }

  getDrawParams() {
    return [];
  }

  hitDetect() {
    return false;
  }

  draw() {
    this.prepareCanvas();
    this.prepareDrawContext();
    this.drawWind();
  }

  _redraw() {
    this.prepareRender();
    this.draw();
  }

  drawWind() {
    const map = this.getMap();
    if (this.context) {
      const layer = this.layer;
      const opt = layer.getOptions();
      if (!this.scalarRender && map) {
        const data = layer.getData();

        this.scalarRender = new ScalarField(this.context, opt, data);

        this.scalarRender.project = this.project.bind(this);
        this.scalarRender.unproject = this.unproject.bind(this);
        this.scalarRender.intersectsCoordinate = this.intersectsCoordinate.bind(this);
        this.scalarRender.postrender = () => {
          // @ts-ignore
          this.setCanvasUpdated();
        };
      }

      if (this.scalarRender) {
        this.scalarRender.prerender();

        this.scalarRender.render();
      }
    }
    this.completeRender();
  }

  project(coordinate: [number, number]): [number, number] {
    const map = this.getMap();
    const pixel = map.coordinateToContainerPoint(new Coordinate(coordinate[0], coordinate[1]));
    return [
      pixel.x,
      pixel.y,
    ];
  }

  unproject(pixel: [number, number]): [number, number] {
    const map = this.getMap();
    const coordinates = map.containerPointToCoordinate(new Point(pixel[0], pixel[1]));
    return coordinates.toArray();
  }

  intersectsCoordinate(coordinate: [number, number]): boolean {
    const map = this.getMap();
    const projExtent = map.getProjExtent();
    const extent = [projExtent.xmin, projExtent.ymin, projExtent.xmax, projExtent.ymax] as Extent;
    const mapExtent = transformExtent(extent, 0) as Extent;
    return containsCoordinate(mapExtent, [coordinate[0], coordinate[1]]) as boolean;
    // return true;
  }

  drawOnInteracting() {
    this.draw();
  }

  onZoomStart(...args: any[]) {
    super.onZoomStart.apply(this, args);
  }

  onZoomEnd(...args: any[]) {
    super.onZoomEnd.apply(this, args);
  }

  onDragRotateStart(...args: any[]) {
    super.onDragRotateStart.apply(this, args);
  }

  onDragRotateEnd(...args: any[]) {
    super.onDragRotateEnd.apply(this, args);
  }

  onMoveStart(...args: any[]) {
    super.onMoveStart.apply(this, args);
  }

  onMoveEnd(...args: any[]) {
    super.onMoveEnd.apply(this, args);
  }

  // onResize() {}

  remove() {
    delete this._drawContext;
    super.remove();
  }

  public getMap() {
    return super.getMap();
  }

  private prepareCanvas() {
    return super.prepareCanvas();
  }


  private prepareDrawContext() {
    super.prepareDrawContext();
  }

  private prepareRender() {
    return super.prepareRender();
  }

  public completeRender() {
    return super.completeRender();
  }
}

export class ScalarLayer extends CanvasLayer {
  private field: any;
  private _map: any;
  private options: any;

  constructor(id: string | number, data: any, options: any) {
    super(id, assign({}, _options, options));

    this.field = null;

    this._map = null;

    if (data) {
      this.setData(data);
    }
  }

  /**
   * get wind layer data
   */
  public getData () {
    return this.field;
  }

  /**
   * set layer data
   * @param data
   * @returns {WindLayer}
   */
  public setData (data: any) {
    if (data && data.checkFields && data.checkFields()) {
      this.field = data;
    } else if (isArray(data)) {
      this.field = formatData(data);
    } else {
      console.error('Illegal data');
    }
    return this;
  }

  public setOptions(options: Partial<IOptions>) {
    this.options = assign(this.options, options || {});

    const renderer = this._getRenderer();
    if (renderer && renderer.scalarRender) {
      renderer.scalarRender.setOptions(this.options);
    }
  }

  public getOptions() {
    return this.options || {};
  }

  public draw() {
    if (this._getRenderer()) {
      this._getRenderer()._redraw();
    }
    return this;
  }

  private prepareToDraw() {
    return [];
  }

  private drawOnInteracting() {
    this.draw();
  }

  private _getRenderer() {
    return super._getRenderer();
  }
}

// @ts-ignore
ScalarLayer.registerRenderer('canvas', ScalarLayerRenderer);
