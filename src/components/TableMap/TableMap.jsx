import { useEffect, useRef, useState } from 'react';
import {
  Armchair,
  CircleUserRound,
  DoorOpen,
  Flame,
  Info,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Trees,
  UtensilsCrossed,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { centerTables } from './TableMapCenter.jsx';
import { ryscanovkaTables } from './TableMapRyscanovka.jsx';
import { useTranslation } from '../../hooks/useTranslation.js';

const AREA_LABELS = {
  gazebo: 'Беседки',
  hookah: 'Кальянная',
  restaurant: 'Ресторан',
  main: 'Зал',
  terrace: 'Веранда',
};

const RYSCANOVKA_AREAS = [
  { id: 'gazebo', label: 'Беседки' },
  { id: 'hookah', label: 'Кальянная' },
  { id: 'restaurant', label: 'Ресторан' },
];

const CENTER_AREAS = [
  { id: 'main', label: 'Зал' },
  { id: 'terrace', label: 'Веранда' },
];

const AREA_ICONS = {
  gazebo: Trees,
  hookah: Flame,
  restaurant: UtensilsCrossed,
  main: UtensilsCrossed,
  terrace: Trees,
};

const USE_LEGACY_GAZEBO_MAP = false;
const USE_REFERENCE_GAZEBO_BACKGROUND = true;
const USE_REFERENCE_RESTAURANT_BACKGROUND = true;
const USE_REFERENCE_HOOKAH_BACKGROUND = true;

const BASE_WIDTH = 1400;
const BASE_HEIGHT = 900;
const HOOKAH_BASE_WIDTH = 900;
const HOOKAH_BASE_HEIGHT = 1400;
const GAZEBO_REFERENCE_MAP_SRC = '/maps/compressed_tiflis-gazebo-reference-map.webp';
const RESTAURANT_REFERENCE_MAP_SRC = '/maps/compressed_tiflis-restaurant-reference-map.webp';
const HOOKAH_REFERENCE_MAP_SRC = '/maps/compressed_tiflis-hookah-reference-map.webp';

const stateClasses = {
  free: 'booking-table-free',
  busy: 'booking-table-busy',
  small: 'booking-table-small',
  banquetIncompatible: 'booking-table-banquet-incompatible',
  selected: 'booking-table-selected',
};

const GAZEBO_TABLE_LAYOUT = [
  { id: 5, seats: 4, x: 149, y: 109, w: 95, h: 81, zone: 'left-top' },
  { id: 6, seats: 4, x: 251, y: 109, w: 95, h: 81, zone: 'left-top' },
  { id: 4, seats: 4, x: 149, y: 198, w: 95, h: 83, zone: 'left-top' },
  { id: 3, seats: 4, x: 251, y: 197, w: 95, h: 84, zone: 'left-top' },
  { id: 7, seats: 8, x: 384, y: 135, w: 181, h: 90, zone: 'upper-middle-left' },
  { id: 9, seats: 4, x: 745, y: 119, w: 96, h: 82, zone: 'right-top-left-block' },
  { id: 10, seats: 4, x: 849, y: 119, w: 96, h: 82, zone: 'right-top-left-block' },
  { id: 8, seats: 4, x: 745, y: 208, w: 96, h: 84, zone: 'right-top-left-block' },
  { id: 11, seats: 4, x: 849, y: 208, w: 96, h: 84, zone: 'right-top-left-block' },
  { id: 13, seats: 4, x: 1057, y: 109, w: 91, h: 89, zone: 'right-top-right-block' },
  { id: 14, seats: 4, x: 1155, y: 109, w: 91, h: 89, zone: 'right-top-right-block' },
  { id: 12, seats: 4, x: 1057, y: 205, w: 91, h: 84, zone: 'right-top-right-block' },
  { id: 15, seats: 4, x: 1155, y: 205, w: 91, h: 84, zone: 'right-top-right-block' },
  { id: 16, seats: 8, x: 1110, y: 361, w: 132, h: 82, zone: 'right-separate' },
  { id: 17, seats: 8, x: 1110, y: 450, w: 132, h: 82, zone: 'right-separate' },
  { id: 18, seats: 8, x: 1110, y: 538, w: 132, h: 83, zone: 'right-separate' },
  { id: 19, seats: 6, x: 452, y: 350, w: 94, h: 83, zone: 'center-open' },
  { id: 2, seats: 6, x: 171, y: 454, w: 97, h: 109, zone: 'left-bottom' },
  { id: 1, seats: 6, x: 183, y: 655, w: 95, h: 85, zone: 'left-bottom' },
];

const RESTAURANT_REFERENCE_TABLE_LAYOUT = [
  { id: 20, x: 85, y: 80, w: 81, h: 79 },
  { id: 21, x: 194, y: 80, w: 84, h: 79 },
  { id: 22, x: 304, y: 80, w: 84, h: 79 },
  { id: 32, x: 84, y: 185, w: 82, h: 79 },

  { id: 23, x: 875, y: 41, w: 78, h: 78 },
  { id: 24, x: 976, y: 41, w: 77, h: 78 },
  { id: 25, x: 1076, y: 41, w: 79, h: 75 },
  { id: 26, x: 1178, y: 41, w: 78, h: 78 },
  { id: 27, x: 1279, y: 41, w: 79, h: 78 },
  { id: 31, x: 969, y: 194, w: 80, h: 77 },
  { id: 30, x: 1073, y: 194, w: 80, h: 77 },
  { id: 29, x: 1176, y: 194, w: 80, h: 77 },
  { id: 28, x: 1279, y: 194, w: 80, h: 77 },

  { id: 60, x: 105, y: 345, w: 84, h: 76 },
  { id: 61, x: 299, y: 345, w: 84, h: 77 },
  { id: 70, x: 105, y: 467, w: 84, h: 76 },
  { id: 71, x: 299, y: 467, w: 84, h: 76 },

  { id: 40, x: 839, y: 335, w: 83, h: 77 },
  { id: 41, x: 958, y: 336, w: 83, h: 74 },
  { id: 42, x: 1076, y: 335, w: 82, h: 77 },
  { id: 80, x: 1209, y: 443, w: 118, h: 159 },
  { id: 'VIP', x: 109, y: 642, w: 153, h: 128 },
  { id: 50, x: 781, y: 709, w: 82, h: 75 },
  { id: 51, x: 885, y: 709, w: 83, h: 75 },
  { id: 52, x: 995, y: 709, w: 83, h: 75 },
  { id: 53, x: 1104, y: 709, w: 83, h: 76 },
  { id: 54, x: 1214, y: 709, w: 83, h: 75 },
];

const HOOKAH_REFERENCE_TABLE_LAYOUT = [
  { id: 5, x: 244, y: 78, w: 117, h: 85 },
  { id: 6, x: 524, y: 78, w: 117, h: 85 },
  { id: 8, x: 244, y: 176, w: 117, h: 85 },
  { id: 7, x: 524, y: 176, w: 117, h: 85 },

  { id: 9, x: 608, y: 401, w: 93, h: 115 },
  { id: 10, x: 711, y: 401, w: 94, h: 115 },
  { id: 1, x: 104, y: 414, w: 92, h: 112 },
  { id: 2, x: 206, y: 414, w: 93, h: 112 },
  { id: 11, x: 608, y: 529, w: 93, h: 113 },
  { id: 12, x: 711, y: 529, w: 94, h: 113 },
  { id: 3, x: 104, y: 538, w: 92, h: 112 },
  { id: 4, x: 206, y: 538, w: 93, h: 112 },

  { id: 13, x: 608, y: 758, w: 94, h: 130 },
  { id: 14, x: 712, y: 758, w: 95, h: 130 },
  { id: 15, x: 608, y: 915, w: 94, h: 129 },
  { id: 16, x: 712, y: 915, w: 95, h: 129 },
];

const RESTAURANT_BANQUET_GROUP_OUTLINES = [
  { id: 'banquet-top-left', x: 56, y: 55, w: 360, h: 238 },
  { id: 'banquet-top-right', x: 846, y: 20, w: 530, h: 278 },
  { id: 'banquet-left-middle', x: 78, y: 318, w: 330, h: 255 },
  { id: 'banquet-center-right', x: 805, y: 316, w: 380, h: 118 },
  { id: 'banquet-bottom-right', x: 756, y: 680, w: 565, h: 132 },
];

const GAZEBO_ZONES = [
  { id: 'left-top-gazebo', label: 'Беседки 3-6', x: 110, y: 80, w: 275, h: 285, tables: [5, 6, 4, 3] },
  { id: 'table-7-area', label: 'Беседка 7', x: 390, y: 85, w: 250, h: 280, tables: [7] },
  { id: 'right-top-left-block', label: 'Беседки 8-11', x: 720, y: 80, w: 280, h: 285, tables: [9, 10, 8, 11] },
  { id: 'right-top-right-block', label: 'Беседки 12-15', x: 1015, y: 80, w: 285, h: 285, tables: [13, 14, 12, 15] },
  { id: 'left-bottom-gazebo', label: 'Беседки 1-2', x: 110, y: 475, w: 270, h: 365, tables: [2, 1] },
  { id: 'right-separate-gazebos', label: 'Беседки 16-18', x: 1085, y: 350, w: 205, h: 340, tables: [16, 17, 18] },
  { id: 'game-zone', label: 'ИГРОВАЯ ЗОНА', x: 940, y: 700, w: 390, h: 160 },
  { id: 'entrance', label: 'ВХОД', x: 620, y: 45, w: 160, h: 115 },
];

const GAZEBO_RESTAURANT_ZONE = {
  id: 'restaurant',
  label: 'РЕСТОРАН',
  x: 406,
  y: 583,
  w: 560,
  h: 236,
};

const GAZEBO_HOOKAH_ZONE = {
  id: 'hookah-transition',
  label: 'ПЕРЕХОД В КАЛЬЯННУЮ',
  x: 38,
  y: 358,
  w: 205,
  h: 158,
};

const GAZEBO_DECORATIVE_WALLS = [
  { id: 'top-left-wall-1', x: 95, y: 112, w: 320, h: 3, type: 'horizontal' },
  { id: 'top-left-wall-2', x: 455, y: 112, w: 85, h: 3, type: 'horizontal' },
  { id: 'top-center-wall-left', x: 590, y: 112, w: 55, h: 3, type: 'horizontal' },
  { id: 'top-center-wall-right', x: 760, y: 112, w: 90, h: 3, type: 'horizontal' },
  { id: 'top-right-wall-1', x: 965, y: 112, w: 260, h: 3, type: 'horizontal' },
  { id: 'left-main-wall', x: 95, y: 112, w: 3, h: 220, type: 'vertical' },
  { id: 'left-bottom-wall', x: 95, y: 500, w: 3, h: 270, type: 'vertical' },
  { id: 'right-main-wall', x: 1290, y: 112, w: 3, h: 500, type: 'vertical' },
];

const GAZEBO_PLANT_CLUSTERS = [
  { id: 'entrance-left-plants-a', x: 438, y: 50, w: 118, h: 82, rotate: -4 },
  { id: 'entrance-left-plants-b', x: 510, y: 55, w: 82, h: 66, rotate: 10 },
  { id: 'entrance-right-plants-a', x: 778, y: 50, w: 118, h: 82, rotate: 4 },
  { id: 'entrance-right-plants-b', x: 722, y: 58, w: 80, h: 60, rotate: -12 },
  { id: 'left-top-bottom-plants', x: 105, y: 330, w: 155, h: 82, rotate: -4 },
  { id: 'left-top-corner-plants', x: 108, y: 130, w: 58, h: 92, rotate: 6 },
  { id: 'table-7-side-plants', x: 622, y: 205, w: 54, h: 130, rotate: 2 },
  { id: 'left-bottom-plants-1', x: 70, y: 635, w: 120, h: 94, rotate: -15 },
  { id: 'left-bottom-plants-2', x: 262, y: 650, w: 110, h: 90, rotate: 10 },
  { id: 'left-bottom-plants-3', x: 78, y: 765, w: 118, h: 78, rotate: -6 },
  { id: 'right-top-side-plants', x: 1245, y: 292, w: 84, h: 126, rotate: 8 },
  { id: 'right-vertical-plants-a', x: 1242, y: 430, w: 86, h: 148, rotate: -4 },
  { id: 'right-vertical-plants-b', x: 1235, y: 560, w: 88, h: 120, rotate: 8 },
  { id: 'game-zone-plants', x: 1165, y: 654, w: 120, h: 82, rotate: 5 },
];

const GAZEBO_DECOR_LAMPS = [
  { id: 'lamp-left-top-1', x: 350, y: 330 },
  { id: 'lamp-left-top-2', x: 120, y: 325 },
  { id: 'lamp-left-bottom-1', x: 300, y: 485 },
  { id: 'lamp-left-bottom-2', x: 315, y: 735 },
  { id: 'lamp-block-8', x: 720, y: 322 },
  { id: 'lamp-block-11', x: 915, y: 322 },
  { id: 'lamp-block-12', x: 1015, y: 325 },
  { id: 'lamp-block-15', x: 1215, y: 325 },
  { id: 'lamp-game-1', x: 960, y: 730 },
  { id: 'lamp-game-2', x: 1240, y: 705 },
];

const PLANT_LEAVES = Array.from({ length: 14 }, (_, index) => index + 1);
const PLANT_GLOWS = Array.from({ length: 5 }, (_, index) => index + 1);

function mapRectStyle(item) {
  return {
    left: item.x,
    top: item.y,
    width: item.w,
    height: item.h,
  };
}

function getBranchTables(branch) {
  return branch?.slug === 'ryscanovka' ? ryscanovkaTables : centerTables;
}

function byNumber(tables, number) {
  return tables.find((table) => table.number === String(number));
}

function useResponsiveMapFrame({ baseWidth, mobileScale = 0.6 }) {
  const wrapperRef = useRef(null);
  const dragRef = useRef(null);
  const hasCenteredMobileRef = useRef(false);
  const [availableWidth, setAvailableWidth] = useState(baseWidth);
  const [isMobileMap, setIsMobileMap] = useState(false);
  const [zoom, setZoom] = useState(mobileScale);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;

    const updateScale = () => {
      const nextWidth = Math.min(
        element.clientWidth || baseWidth,
        element.parentElement?.clientWidth || baseWidth,
        globalThis.document?.documentElement?.clientWidth || baseWidth,
      );

      if (!nextWidth) return;
      setAvailableWidth(nextWidth);
      setIsMobileMap(nextWidth < 600);
    };

    updateScale();

    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.addEventListener('resize', updateScale);
      return () => globalThis.removeEventListener('resize', updateScale);
    }

    const observer = new globalThis.ResizeObserver(updateScale);
    observer.observe(element);

    return () => observer.disconnect();
  }, [baseWidth]);

  const fitScale = Math.min(1, availableWidth / baseWidth);
  const scale = isMobileMap ? zoom : fitScale;

  useEffect(() => {
    if (!isMobileMap) {
      hasCenteredMobileRef.current = false;
      return undefined;
    }

    if (hasCenteredMobileRef.current) return undefined;

    const animationFrame = globalThis.requestAnimationFrame?.(() => {
      const element = wrapperRef.current;
      if (!element) return;
      element.scrollLeft = Math.max(0, (element.scrollWidth - element.clientWidth) / 2);
      hasCenteredMobileRef.current = true;
    });

    return () => {
      if (animationFrame) globalThis.cancelAnimationFrame?.(animationFrame);
    };
  }, [isMobileMap, scale]);

  const zoomOut = () => setZoom((current) => Math.max(0.25, Number((current - 0.1).toFixed(2))));
  const zoomIn = () => setZoom((current) => Math.min(1.25, Number((current + 0.1).toFixed(2))));
  const resetZoom = () => {
    hasCenteredMobileRef.current = false;
    setZoom(mobileScale);
  };

  const onPointerDown = (event) => {
    if (!isMobileMap || event.target.closest('button, a, input, select, textarea')) return;

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      scrollTop: event.currentTarget.scrollTop,
      isDragging: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (!drag.isDragging) {
      if (absX < 8 && absY < 8) return;

      if (absY > absX + 4) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        dragRef.current = null;
        return;
      }

      drag.isDragging = true;
    }

    event.preventDefault();
    event.currentTarget.scrollLeft = drag.scrollLeft - deltaX;
    event.currentTarget.scrollTop = drag.scrollTop - deltaY;
  };

  const stopPointerDrag = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragRef.current = null;
  };

  return {
    wrapperRef,
    isMobileMap,
    scale,
    zoom,
    zoomOut,
    zoomIn,
    resetZoom,
    panHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stopPointerDrag,
      onPointerCancel: stopPointerDrag,
      onPointerLeave: stopPointerDrag,
    },
  };
}

function MapZoomControls({ isMobileMap, zoom, onZoomIn, onZoomOut, onReset, mapCopy }) {
  if (!isMobileMap) return null;

  return (
    <div className="map-zoom-controls" aria-label={mapCopy.zoom.controls}>
      <span className="map-zoom-controls-hint">
        <Move className="h-4 w-4" aria-hidden="true" />
        <span>{Math.round(zoom * 100)}%</span>
      </span>
      <button type="button" onClick={onZoomOut} aria-label={mapCopy.zoom.out}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={onReset} aria-label={mapCopy.zoom.reset}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={onZoomIn} aria-label={mapCopy.zoom.in}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function ResponsiveMapFrame({
  baseWidth,
  baseHeight,
  wrapperClassName,
  holderClassName,
  mapClassName,
  mobileScale = 0.6,
  mapCopy,
  children,
}) {
  const frame = useResponsiveMapFrame({ baseWidth, mobileScale });

  return (
    <div className={['map-responsive-shell', frame.isMobileMap ? 'map-responsive-shell-mobile' : ''].join(' ')}>
      <div
        className={`${wrapperClassName} responsive-map-viewport`}
        ref={frame.wrapperRef}
        {...frame.panHandlers}
      >
        <div
          className={`${holderClassName} map-scaled-holder`}
          style={{
            width: `${baseWidth * frame.scale}px`,
            height: `${baseHeight * frame.scale}px`,
          }}
        >
          <div
            className={mapClassName}
            style={{
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
              transform: `scale(${frame.scale})`,
              transformOrigin: 'top left',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <MapZoomControls
        isMobileMap={frame.isMobileMap}
        zoom={frame.zoom}
        onZoomIn={frame.zoomIn}
        onZoomOut={frame.zoomOut}
        onReset={frame.resetZoom}
        mapCopy={mapCopy}
      />
    </div>
  );
}

function isCompatibleWithBanquetSelection(table, selectedTables) {
  if (selectedTables.length === 0) return true;

  const firstTable = selectedTables[0];
  const firstGroup = firstTable.mergeGroup ?? firstTable.id;
  const tableGroup = table.mergeGroup ?? table.id;

  return firstTable.zone === table.zone && firstGroup === tableGroup;
}

function statusForTable({ table, guestsCount, reservedTableIds, selectedTableId, selectedTableIds, selectedTables }) {
  if (table.id === selectedTableId || selectedTableIds.includes(table.id)) return 'selected';
  if (reservedTableIds.includes(table.id)) return 'busy';
  if (guestsCount > table.capacity) return 'small';
  if (!isCompatibleWithBanquetSelection(table, selectedTables)) return 'banquetIncompatible';
  return 'free';
}

function TableButton({
  table,
  guestsCount,
  reservedTableIds,
  selectedTableId,
  selectedTableIds,
  selectedTables,
  tableAnnotations,
  allowDisabledTableClick,
  onDisabledTableClick,
  onSelectTable,
  className = 'h-16 w-16',
  compact = false,
  mapCopy,
}) {
  if (!table) return null;

  const status = statusForTable({
    table,
    guestsCount,
    reservedTableIds,
    selectedTableId,
    selectedTableIds,
    selectedTables,
  });
  const isDisabledStatus = status === 'busy' || status === 'small' || status === 'banquetIncompatible';
  const canInspectDisabled = allowDisabledTableClick && isDisabledStatus;
  const disabled = isDisabledStatus && !canInspectDisabled;
  const annotations = tableAnnotations?.[table.id] ?? [];

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (isDisabledStatus) {
          onDisabledTableClick?.(table);
          return;
        }
        onSelectTable(table);
      }}
      whileHover={disabled ? undefined : { y: -2, scale: 1.025 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'booking-table-button relative z-10 grid min-h-11 min-w-11 shrink-0 touch-manipulation place-items-center rounded-[0.8rem] border text-center text-xs font-bold transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B1513] disabled:hover:translate-y-0',
        stateClasses[status],
        canInspectDisabled ? 'booking-table-inspectable' : '',
        className,
      ].join(' ')}
      aria-label={`${mapCopy.tableAria} ${table.number}, ${table.capacity} ${mapCopy.seatsAria}`}
    >
      <span className="grid justify-items-center leading-none">
        <Armchair className={compact ? 'mb-1 h-3.5 w-3.5' : 'mb-1 h-4 w-4'} aria-hidden="true" />
        <span>{table.number}</span>
        <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold opacity-80">
          <CircleUserRound className="h-3 w-3" aria-hidden="true" />
          {table.capacity}
        </span>
      </span>
      {annotations.length > 0 ? (
        <span className="booking-table-reservation-note" aria-hidden="true">
          {annotations.slice(0, 2).map((annotation) => (
            <span key={`${annotation.time}-${annotation.guests}`} className="booking-table-reservation-row">
              <span>{annotation.time}</span>
              <span>{annotation.guests}</span>
            </span>
          ))}
          {annotations.length > 2 ? <span className="booking-table-reservation-more">+{annotations.length - 2}</span> : null}
        </span>
      ) : null}
    </motion.button>
  );
}

function PlanGroup({ className = '', children }) {
  return (
    <div
      className={`booking-plan-group rounded-2xl border p-2 ${className}`}
    >
      {children}
    </div>
  );
}

function InteractiveRestaurantBlock({ onAreaChange, mapCopy }) {
  return (
    <motion.button
      type="button"
      onClick={() => onAreaChange('restaurant')}
      className="booking-restaurant-entry absolute left-[31%] top-[55%] grid h-[29%] w-[39%] place-items-center text-cream transition"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="grid justify-items-center gap-1.5">
        <UtensilsCrossed className="h-7 w-7 text-gold/80" aria-hidden="true" />
        <span className="font-display text-2xl font-semibold uppercase tracking-[0.08em]">{mapCopy.restaurantEntry}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cream/45">{mapCopy.enterInside}</span>
      </span>
    </motion.button>
  );
}

function Legend({ selectedCount = 0, mapCopy }) {
  return (
    <div className="booking-map-legend">
      <span className="booking-map-legend-item">
        <span className="booking-map-legend-dot bg-[#5F9448]" />
        {mapCopy.legend.free}
      </span>
      <span className="booking-map-legend-item">
        <span className="booking-map-legend-dot bg-[#C28A2E] ring-2 ring-gold/70" />
        {selectedCount > 1 ? mapCopy.legend.selectedBanquet : mapCopy.legend.selected}
      </span>
      <span className="booking-map-legend-item">
        <span className="booking-map-legend-dot bg-[#4A403B]" />
        {mapCopy.legend.busy}
      </span>
      <span className="booking-map-legend-item">
        <span className="booking-map-legend-dot bg-[#332D2A]" />
        {mapCopy.legend.unsuitable}
      </span>
    </div>
  );
}

function AreaTabs({ areas, activeArea, onAreaChange, mapCopy }) {
  return (
    <div className="booking-area-tabs" role="tablist" aria-label={mapCopy.zonesAria}>
      {areas.map((area) => {
        const Icon = AREA_ICONS[area.id] ?? Armchair;
        const isActive = activeArea === area.id;

        return (
          <motion.button
            key={area.id}
            type="button"
            onClick={() => onAreaChange(area.id)}
            className={`booking-area-tab ${isActive ? 'booking-area-tab-active' : ''}`}
            role="tab"
            aria-selected={isActive}
            layout
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {area.label}
          </motion.button>
        );
      })}
    </div>
  );
}

function GazeboFloorPlanLayerLegacy() {
  return (
    <svg
      className="booking-floor-art gazebo-floor-art absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 1040 680"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="gazeboFloorHatch" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 22 L22 0" className="booking-floor-art-hatch" />
        </pattern>
        <radialGradient id="gazeboWarmSpot" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="#C28A2E" stopOpacity="0.1" />
          <stop offset="62%" stopColor="#171210" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#050403" stopOpacity="0.28" />
        </radialGradient>
        <filter id="gazeboSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="gazeboAmberGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0.76 0 1 0 0 0.44 0 0 1 0 0.12 0 0 0 0.9 0"
            result="warmBlur"
          />
          <feMerge>
            <feMergeNode in="warmBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <symbol id="gazeboPlant" viewBox="0 0 44 44">
          <path d="M22 38 V20" />
          <path d="M22 21 C13 19 9 12 13 7 C20 9 23 15 22 21Z" />
          <path d="M22 22 C32 20 37 13 32 8 C25 10 22 16 22 22Z" />
          <path d="M22 26 C13 27 8 32 9 39 C17 40 22 33 22 26Z" />
          <path d="M22 26 C31 26 37 31 35 38 C28 40 23 33 22 26Z" />
        </symbol>
        <symbol id="gazeboLamp" viewBox="0 0 34 52">
          <path d="M17 6 V46" />
          <path d="M10 16 H24 L21 28 H13 Z" />
          <path d="M13 46 H21" />
        </symbol>
        <symbol id="gazeboKids" viewBox="0 0 120 72">
          <path d="M18 50 C38 24 64 20 98 28" />
          <circle cx="86" cy="23" r="8" />
          <circle cx="39" cy="43" r="6" />
          <path d="M65 45 H105" />
          <path d="M72 36 L90 54" />
        </symbol>
        <symbol id="gazeboFood" viewBox="0 0 120 84">
          <circle cx="82" cy="45" r="20" />
          <circle cx="82" cy="45" r="12" />
          <circle cx="35" cy="48" r="12" />
          <circle cx="102" cy="22" r="9" />
          <path d="M20 24 L56 56" />
          <path d="M24 20 L60 52" />
          <path d="M14 62 H52" />
          <path d="M68 20 C76 15 88 15 96 20" />
        </symbol>
      </defs>

      <rect x="18" y="18" width="1004" height="644" rx="18" className="booking-floor-art-outer" />
      <rect x="34" y="34" width="972" height="610" rx="16" fill="url(#gazeboWarmSpot)" />
      <rect x="34" y="34" width="972" height="610" rx="16" fill="url(#gazeboFloorHatch)" opacity="0.08" />
      <path d="M78 112 H344 V296 H276 V318 H78 Z" className="booking-floor-art-room" />
      <path d="M732 536 H976 V626 H732 Z" className="booking-floor-art-side" />
      <path d="M34 314 H132 V414 H34 Z" className="booking-floor-art-side" />

      <path d="M78 100 H372 M462 100 H492 M548 100 H578 M730 100 H952" className="booking-floor-art-wall" />
      <path d="M492 100 V142 M548 100 V142" className="booking-floor-art-wall" />
      <path d="M492 142 C506 110 534 110 548 142" className="booking-floor-art-soft" />
      <path d="M506 124 C516 104 524 104 538 124" className="booking-floor-art-soft" />
      <path d="M482 120 C498 72 542 72 558 120" className="booking-floor-art-arch" />
      <path d="M498 116 C512 86 528 86 542 116" className="booking-floor-art-arch" />
      <path d="M492 100 L484 86 M548 100 L556 86" className="booking-floor-art-arch" />
      <path d="M520 146 V190" className="booking-floor-art-soft" />
      <path d="M506 176 L520 190 L534 176" className="booking-floor-art-wall" />
      <path d="M78 296 V344" className="booking-floor-art-wall" />
      <path d="M132 414 H34 V314 H132" className="booking-floor-art-wall" />
      <path d="M122 366 H78 M94 350 L78 366 L94 382" className="booking-floor-art-wall" />
      <path d="M732 536 H976 V626 H732 Z" className="booking-floor-art-wall" />

      <use href="#gazeboPlant" x="372" y="58" width="56" height="56" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="432" y="60" width="52" height="52" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="562" y="58" width="52" height="52" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="616" y="58" width="56" height="56" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="116" y="282" width="54" height="54" className="booking-floor-art-symbol" />
      <use href="#gazeboPlant" x="114" y="504" width="64" height="64" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="224" y="470" width="56" height="56" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="916" y="294" width="64" height="64" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboPlant" x="932" y="454" width="58" height="58" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboLamp" x="438" y="66" width="28" height="46" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboLamp" x="574" y="66" width="28" height="46" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboLamp" x="230" y="356" width="26" height="44" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboLamp" x="738" y="586" width="26" height="42" className="booking-floor-art-symbol booking-floor-art-glow" />
      <use href="#gazeboFood" x="846" y="532" width="116" height="78" className="booking-floor-art-symbol booking-floor-art-glow" />
      <circle cx="414" cy="82" r="3" className="booking-floor-art-light" />
      <circle cx="458" cy="108" r="3" className="booking-floor-art-light" />
      <circle cx="582" cy="108" r="3" className="booking-floor-art-light" />
      <circle cx="626" cy="82" r="3" className="booking-floor-art-light" />
      <circle cx="118" cy="292" r="2.5" className="booking-floor-art-light" />
      <circle cx="236" cy="386" r="2.5" className="booking-floor-art-light" />
      <circle cx="152" cy="520" r="3" className="booking-floor-art-light" />
      <circle cx="930" cy="338" r="2.5" className="booking-floor-art-light" />
      <circle cx="938" cy="486" r="3" className="booking-floor-art-light" />
      <circle cx="738" cy="586" r="3" className="booking-floor-art-light" />

      <text x="492" y="142" className="booking-floor-art-label">ВХОД</text>
      <text x="48" y="382" className="booking-floor-art-label">ПЕРЕХОД В</text>
      <text x="48" y="404" className="booking-floor-art-label">КАЛЬЯННУЮ</text>
      <text x="760" y="566" className="booking-floor-art-label">ИГРОВАЯ ЗОНА</text>
      <text x="760" y="590" className="booking-floor-art-small">МАСТЕР-КЛАССЫ</text>
      <text x="760" y="610" className="booking-floor-art-small">ДЛЯ ДЕТЕЙ</text>
    </svg>
  );
}

function GazeboMapLegacy({ tables, tableProps, onAreaChange, mapCopy }) {
  const t = (number) => byNumber(tables, number);

  return (
    <div className="booking-floor-map booking-floor-map-gazebo relative mx-auto h-[680px] w-[1040px] max-w-none overflow-hidden rounded-2xl border border-cream/15">
      <GazeboFloorPlanLayerLegacy />

      <PlanGroup className="absolute left-[10.5%] top-[16%] h-[142px] w-[150px]">
        <div className="grid grid-cols-2 gap-2">
          {[5, 6, 4, 3].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-[52px] w-[62px]" />
          ))}
        </div>
      </PlanGroup>

      <div className="absolute left-[31.5%] top-[20%]">
        <TableButton table={t(7)} {...tableProps} className="h-[68px] w-36" />
      </div>

      <PlanGroup className="absolute left-[56%] top-[17%] h-[144px] w-[150px]">
        <div className="grid grid-cols-2 gap-2">
          {[9, 10, 8, 11].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-[54px] w-[62px]" />
          ))}
        </div>
      </PlanGroup>

      <PlanGroup className="absolute left-[77.5%] top-[16%] h-[144px] w-[150px]">
        <div className="grid grid-cols-2 gap-2">
          {[13, 14, 12, 15].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-[54px] w-[62px]" />
          ))}
        </div>
      </PlanGroup>

      <div className="absolute left-[15%] top-[56%]">
        <TableButton table={t(2)} {...tableProps} className="h-[84px] w-[70px]" />
      </div>

      <div className="absolute left-[16%] top-[78%]">
        <TableButton table={t(1)} {...tableProps} className="h-[72px] w-[70px]" />
      </div>

      <div className="absolute left-[36%] top-[43%]">
        <TableButton table={t(19)} {...tableProps} className="h-16 w-16" />
      </div>

      <InteractiveRestaurantBlock onAreaChange={onAreaChange} mapCopy={mapCopy} />

      <div className="absolute left-[82%] top-[41%] grid gap-2.5">
        {[16, 17, 18].map((number) => (
          <TableButton key={number} table={t(number)} {...tableProps} className="h-[62px] w-28" />
        ))}
      </div>

      <div className="booking-gazebo-hint absolute bottom-[2.2%] left-1/2 z-10 flex -translate-x-1/2 items-center justify-center px-5 py-2.5">
        <span className="inline-flex items-center gap-2">
          <Info className="h-4 w-4 text-gold" aria-hidden="true" />
          {mapCopy.hint}
        </span>
      </div>
    </div>
  );
}

function GazeboZone({ zone, mapCopy }) {
  return (
    <div
      className={`booking-gazebo-zone booking-gazebo-zone-${zone.id}`}
      style={mapRectStyle(zone)}
      aria-hidden="true"
    >
      {zone.id === 'entrance' ? (
        <span className="booking-gazebo-entrance-label">
          {zone.label}
          <span>↓</span>
        </span>
      ) : null}
      {zone.id === 'game-zone' ? (
        <span className="booking-gazebo-game-label">
          <span>{zone.label}</span>
          <small>{mapCopy.gameZoneDetail}</small>
        </span>
      ) : null}
    </div>
  );
}

function GazeboActionZone({ zone, area, icon: Icon, onAreaChange, children }) {
  return (
    <motion.button
      type="button"
      className={`booking-gazebo-action booking-gazebo-action-${zone.id}`}
      style={mapRectStyle(zone)}
      onClick={() => onAreaChange(area)}
      aria-label={zone.label}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="h-8 w-8 text-gold" aria-hidden="true" />
      {children}
    </motion.button>
  );
}

function DecorativeWall({ wall }) {
  return (
    <div
      className={`decor-wall ${wall.type}`}
      style={mapRectStyle(wall)}
    />
  );
}

function PlantCluster({ x, y, w = 90, h = 70, rotate = 0 }) {
  return (
    <div
      className="plant-cluster"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {PLANT_LEAVES.map((leaf) => (
        <span key={`leaf-${leaf}`} className={`plant-leaf plant-leaf-${leaf}`} />
      ))}
      {PLANT_GLOWS.map((glow) => (
        <span key={`glow-${glow}`} className={`plant-glow plant-glow-${glow}`} />
      ))}
    </div>
  );
}

function DecorLamp({ lamp }) {
  return (
    <div
      className="decor-lamp"
      style={{
        left: lamp.x,
        top: lamp.y,
      }}
    >
      <span />
    </div>
  );
}

function EntranceArch({ mapCopy }) {
  return (
    <div className="entrance-arch">
      <div className="arch-column left" />
      <div className="arch-column right" />
      <div className="arch-curve" />
      <div className="arch-curve arch-curve-inner" />
      <div className="arch-crown" />
      <div className="arch-lamp left" />
      <div className="arch-lamp right" />
      <div className="entrance-label">
        <span>{mapCopy.entrance}</span>
        <span className="entrance-arrow">↓</span>
      </div>
    </div>
  );
}

function GazeboMap({ tables, tableProps, onAreaChange, mapCopy }) {
  if (USE_LEGACY_GAZEBO_MAP) {
    return <GazeboMapLegacy tables={tables} tableProps={tableProps} onAreaChange={onAreaChange} mapCopy={mapCopy} />;
  }

  const t = (number) => byNumber(tables, number);
  const architecturalZones = USE_REFERENCE_GAZEBO_BACKGROUND
    ? []
    : GAZEBO_ZONES.filter((zone) => zone.id !== 'entrance');

  return (
    <ResponsiveMapFrame
      baseWidth={BASE_WIDTH}
      baseHeight={BASE_HEIGHT}
      wrapperClassName="booking-gazebo-map-fit-wrapper map-fit-wrapper"
      holderClassName="booking-gazebo-scaled-holder"
      mapCopy={mapCopy}
      mapClassName={[
        'booking-floor-map booking-floor-map-gazebo booking-gazebo-coordinate-map floor-map-canvas relative overflow-hidden rounded-2xl border border-cream/15',
        USE_REFERENCE_GAZEBO_BACKGROUND ? 'booking-gazebo-reference-map' : '',
      ].join(' ')}
    >
          <div className="map-bg-layer">
            {USE_REFERENCE_GAZEBO_BACKGROUND ? (
              <img className="gazebo-reference-bg" src={GAZEBO_REFERENCE_MAP_SRC} alt="" aria-hidden="true" />
            ) : (
              <div className="booking-gazebo-map-bg absolute inset-0" aria-hidden="true" />
            )}
          </div>

          {!USE_REFERENCE_GAZEBO_BACKGROUND ? (
            <div className="map-wall-layer" aria-hidden="true">
              {GAZEBO_DECORATIVE_WALLS.map((wall) => (
                <DecorativeWall key={wall.id} wall={wall} />
              ))}
            </div>
          ) : null}

          {!USE_REFERENCE_GAZEBO_BACKGROUND ? (
            <div className="map-decor-layer" aria-hidden="true">
              {GAZEBO_PLANT_CLUSTERS.map((plant) => (
                <PlantCluster
                  key={plant.id}
                  x={plant.x}
                  y={plant.y}
                  w={plant.w}
                  h={plant.h}
                  rotate={plant.rotate}
                />
              ))}

              {GAZEBO_DECOR_LAMPS.map((lamp) => (
                <DecorLamp key={lamp.id} lamp={lamp} />
              ))}

              <EntranceArch mapCopy={mapCopy} />
            </div>
          ) : null}

          <div className="map-zone-layer">
            {architecturalZones.map((zone) => (
              <GazeboZone key={zone.id} zone={zone} mapCopy={mapCopy} />
            ))}

            <GazeboActionZone zone={GAZEBO_HOOKAH_ZONE} area="hookah" icon={Flame} onAreaChange={onAreaChange}>
              <span className="text-center text-[0.74rem] font-bold uppercase leading-tight tracking-[0.12em]">
                {mapCopy.hookahEntry}
              </span>
            </GazeboActionZone>

            <GazeboActionZone
              zone={GAZEBO_RESTAURANT_ZONE}
              area="restaurant"
              icon={UtensilsCrossed}
              onAreaChange={onAreaChange}
            >
              <span className="font-display text-3xl font-semibold uppercase tracking-[0.08em]">{mapCopy.restaurantEntry}</span>
              <small className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cream/52">{mapCopy.enterInside}</small>
            </GazeboActionZone>
          </div>

          <div className="map-table-layer">
            {GAZEBO_TABLE_LAYOUT.map((item) => (
              <div key={item.id} className="pointer-events-auto absolute z-20" style={mapRectStyle(item)}>
                <TableButton
                  table={t(item.id)}
                  {...tableProps}
                  compact={item.w < 96}
                  className="booking-gazebo-table-button h-full w-full rounded-[0.9rem]"
                />
              </div>
            ))}
          </div>

          {!USE_REFERENCE_GAZEBO_BACKGROUND ? (
            <div className="map-ui-layer">
              <div className="booking-gazebo-hint absolute bottom-[2.2%] left-1/2 z-30 flex -translate-x-1/2 items-center justify-center px-5 py-2.5">
                <span className="inline-flex items-center gap-2">
                  <Info className="h-4 w-4 text-gold" aria-hidden="true" />
                  {mapCopy.hint}
                </span>
              </div>
            </div>
          ) : null}
    </ResponsiveMapFrame>
  );
}

function HookahReferenceMap({ tables, tableProps, mapCopy }) {
  const t = (number) => byNumber(tables, number);

  return (
    <ResponsiveMapFrame
      baseWidth={HOOKAH_BASE_WIDTH}
      baseHeight={HOOKAH_BASE_HEIGHT}
      wrapperClassName="booking-hookah-map-fit-wrapper map-fit-wrapper"
      holderClassName="booking-hookah-scaled-holder"
      mapCopy={mapCopy}
      mapClassName="booking-floor-map booking-floor-map-hookah booking-hookah-reference-map floor-map-canvas relative overflow-hidden rounded-2xl border border-cream/15"
    >
          <img className="hookah-reference-bg" src={HOOKAH_REFERENCE_MAP_SRC} alt="" aria-hidden="true" />

          <div className="map-table-layer">
            {HOOKAH_REFERENCE_TABLE_LAYOUT.map((item) => (
              <div key={item.id} className="pointer-events-auto absolute z-20" style={mapRectStyle(item)}>
                <TableButton
                  table={t(item.id)}
                  {...tableProps}
                  compact
                  className="booking-reference-table-button h-full w-full rounded-[0.9rem]"
                />
              </div>
            ))}
          </div>
    </ResponsiveMapFrame>
  );
}

function HookahMap({ tables, tableProps, mapCopy }) {
  if (USE_REFERENCE_HOOKAH_BACKGROUND) {
    return <HookahReferenceMap tables={tables} tableProps={tableProps} mapCopy={mapCopy} />;
  }

  const t = (number) => byNumber(tables, number);

  return (
    <div className="booking-floor-map relative mx-auto h-[500px] min-w-[760px] max-w-[940px] rounded-2xl border border-cream/15">
      <div className="booking-plan-fixture absolute bottom-5 left-[5%] grid h-36 w-28 place-items-center text-3xl font-medium text-cream">
        {mapCopy.bar}
      </div>

      <div className="hookah-stairs absolute bottom-10 left-1/2 -translate-x-1/2">
        <span />
        <span />
        <span />
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.18em] text-cream/50">
        {mapCopy.entrance}
      </p>

      <div className="booking-booth-frame absolute left-[6%] top-[24%] grid h-[120px] w-[92px] place-items-center">
        <TableButton table={t(1)} {...tableProps} className="h-20 w-14" />
      </div>

      <div className="booking-booth-frame absolute left-1/2 top-[8%] grid h-[82px] w-[330px] -translate-x-1/2 place-items-center">
        <TableButton table={t(2)} {...tableProps} className="h-14 w-[300px]" />
      </div>

      <div className="booking-booth-frame absolute right-[9%] top-[30%] grid h-[108px] w-[92px] place-items-center">
        <TableButton table={t(3)} {...tableProps} className="h-16 w-16" />
      </div>

      <div className="booking-booth-frame absolute right-[9%] top-[55%] grid h-[132px] w-[92px] place-items-center">
        <TableButton table={t(4)} {...tableProps} className="h-28 w-16" />
      </div>
    </div>
  );
}

function RestaurantFloorPlanLayer() {
  return (
    <svg
      className="booking-floor-art absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 820 640"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="floorHatch" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 22 L22 0" className="booking-floor-art-hatch" />
        </pattern>
        <symbol id="plantMark" viewBox="0 0 42 42">
          <path d="M21 36 V19" />
          <path d="M21 20 C12 18 9 11 13 6 C20 8 22 14 21 20Z" />
          <path d="M21 22 C31 20 35 13 31 8 C24 10 21 16 21 22Z" />
          <path d="M21 25 C13 26 8 31 9 37 C17 38 21 32 21 25Z" />
          <path d="M21 25 C30 25 35 30 34 36 C27 38 22 32 21 25Z" />
        </symbol>
        <symbol id="chairCluster" viewBox="0 0 52 52">
          <circle cx="14" cy="14" r="5" />
          <circle cx="38" cy="14" r="5" />
          <circle cx="14" cy="38" r="5" />
          <circle cx="38" cy="38" r="5" />
          <rect x="21" y="21" width="10" height="10" rx="2" />
        </symbol>
        <symbol id="wineMark" viewBox="0 0 54 54">
          <path d="M17 8 H37 C37 21 33 28 27 28 C21 28 17 21 17 8Z" />
          <path d="M27 28 V42" />
          <path d="M17 44 H37" />
        </symbol>
      </defs>

      <rect x="18" y="18" width="784" height="604" rx="14" className="booking-floor-art-outer" />
      <rect x="22" y="22" width="776" height="596" rx="12" fill="url(#floorHatch)" opacity="0.2" />
      <path d="M38 76 H286 V216 H342 V238 H38 Z" className="booking-floor-art-room" />
      <path d="M474 58 H782 V218 H474 Z" className="booking-floor-art-room" />
      <path d="M38 268 H242 V598 H38 Z" className="booking-floor-art-room" />
      <path d="M256 268 H714 V598 H256 Z" className="booking-floor-art-room" />
      <path d="M714 268 H782 V598 H714 Z" className="booking-floor-art-side" />

      <path d="M22 238 H798" className="booking-floor-art-wall" />
      <path d="M342 238 V216 H474 V238" className="booking-floor-art-wall" />
      <path d="M242 268 V598" className="booking-floor-art-wall" />
      <path d="M714 268 V598" className="booking-floor-art-wall" />
      <path d="M392 598 V552 H512 V598" className="booking-floor-art-wall" />
      <path d="M402 610 H502 M414 620 H490" className="booking-floor-art-soft" />

      <path d="M616 370 C655 370 677 386 677 416 C677 445 655 462 616 462" className="booking-floor-art-counter" />
      <path d="M631 392 C652 395 660 404 660 418 C660 433 650 443 629 446" className="booking-floor-art-soft" />
      <path d="M728 424 H768 V574 H728 Z" className="booking-floor-art-shelf" />
      <path d="M736 440 H760 M736 462 H760 M736 484 H760 M736 506 H760 M736 528 H760" className="booking-floor-art-soft" />

      <path d="M188 340 C170 352 166 374 184 390" className="booking-floor-art-soft" />
      <path d="M206 340 C188 352 184 374 202 390" className="booking-floor-art-soft" />
      <path d="M58 312 C78 318 86 334 78 354 C69 374 55 380 38 374" className="booking-floor-art-soft" />

      <use href="#plantMark" x="82" y="404" width="48" height="48" className="booking-floor-art-symbol" />
      <use href="#plantMark" x="314" y="422" width="42" height="42" className="booking-floor-art-symbol" />
      <use href="#plantMark" x="562" y="556" width="40" height="40" className="booking-floor-art-symbol" />
      <use href="#plantMark" x="737" y="80" width="38" height="38" className="booking-floor-art-symbol" />
      <use href="#chairCluster" x="622" y="466" width="54" height="54" className="booking-floor-art-symbol booking-floor-art-muted" />
      <use href="#wineMark" x="606" y="500" width="58" height="58" className="booking-floor-art-symbol" />

      <path d="M310 390 C330 376 354 376 374 390 C354 404 330 404 310 390Z" className="booking-floor-art-ornament" />
      <path d="M342 378 V418 M326 384 L358 416 M358 384 L326 416" className="booking-floor-art-soft" />

      <text x="102" y="196" className="booking-floor-art-label">ВЕРАНДА</text>
      <text x="572" y="196" className="booking-floor-art-label">ВЕРАНДА</text>
      <text x="296" y="428" className="booking-floor-art-title">РЕСТОРАН</text>
      <text x="590" y="536" className="booking-floor-art-label">БАР</text>
      <text x="426" y="578" className="booking-floor-art-label">ВХОД</text>
    </svg>
  );
}

function RestaurantReferenceMap({ tables, tableProps, mapCopy }) {
  const t = (number) => byNumber(tables, number);
  const groupTables = (groupId) => tables.filter((table) => table.mergeGroup === groupId);

  return (
    <ResponsiveMapFrame
      baseWidth={BASE_WIDTH}
      baseHeight={BASE_HEIGHT}
      wrapperClassName="booking-restaurant-map-fit-wrapper map-fit-wrapper"
      holderClassName="booking-restaurant-scaled-holder"
      mapCopy={mapCopy}
      mapClassName="booking-floor-map booking-floor-map-restaurant booking-restaurant-reference-map floor-map-canvas relative overflow-hidden rounded-2xl border border-cream/15"
    >
          <img className="restaurant-reference-bg" src={RESTAURANT_REFERENCE_MAP_SRC} alt="" aria-hidden="true" />

          <div className="map-zone-layer" aria-hidden="true">
            {RESTAURANT_BANQUET_GROUP_OUTLINES.map((group) => {
              const items = groupTables(group.id);
              const isActive = items.length > 0 && items.every((table) => tableProps.selectedTableIds.includes(table.id));
              const isUnavailable = items.some((table) => tableProps.reservedTableIds.includes(table.id));

              return (
                <div
                  key={group.id}
                  className={[
                    'banquet-group-outline',
                    isActive ? 'active' : '',
                    isUnavailable ? 'unavailable' : '',
                  ].join(' ')}
                  style={mapRectStyle(group)}
                />
              );
            })}
          </div>

          <div className="map-table-layer">
            {RESTAURANT_REFERENCE_TABLE_LAYOUT.map((item) => (
              <div key={item.id} className="pointer-events-auto absolute z-20" style={mapRectStyle(item)}>
                <TableButton
                  table={t(item.id)}
                  {...tableProps}
                  compact={item.w < 100 && item.h < 100}
                  className="booking-reference-table-button h-full w-full rounded-[0.9rem]"
                />
              </div>
            ))}
          </div>
    </ResponsiveMapFrame>
  );
}

function RestaurantMap({ tables, tableProps, mapCopy }) {
  if (USE_REFERENCE_RESTAURANT_BACKGROUND) {
    return <RestaurantReferenceMap tables={tables} tableProps={tableProps} mapCopy={mapCopy} />;
  }

  const t = (number) => byNumber(tables, number);

  return (
    <div className="booking-floor-map booking-floor-map-restaurant relative mx-auto h-[640px] min-w-[620px] max-w-[820px] overflow-hidden rounded-2xl border border-cream/15">
      <RestaurantFloorPlanLayer />

      <section className="relative h-[238px] px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">{mapCopy.terrace}</p>

        <div className="absolute left-[43%] top-7 bottom-7 grid justify-items-center text-gold" aria-hidden="true">
          <div className="relative h-full w-20">
            <span className="absolute left-1/2 top-0 h-[76%] w-px -translate-x-1/2 bg-gold/40" />
            <span className="absolute left-[20%] top-[18%] h-px w-14 bg-gold/40" />
            <span className="absolute left-[36%] top-[38%] h-px w-12 rotate-12 bg-gold/40" />
            <span className="absolute left-[24%] top-[58%] h-px w-14 bg-gold/40" />
            <span className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-gold/50" />
          </div>
        </div>

        <div className="absolute left-8 top-[68px] flex gap-2.5">
          {[20, 21, 22].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} compact className="h-[76px] w-14" />
          ))}
        </div>
        <div className="absolute right-8 top-[58px] flex gap-2.5">
          {[23, 24, 25, 26, 27].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} compact className="h-[74px] w-12" />
          ))}
        </div>
        <div className="absolute bottom-7 left-8">
          <TableButton table={t(32)} {...tableProps} compact className="h-16 w-20" />
        </div>
        <div className="absolute bottom-7 right-8 flex gap-2.5">
          {[31, 30, 29, 28].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} compact className="h-[74px] w-12" />
          ))}
        </div>
      </section>

      <section className="relative h-[402px] px-6 py-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cream/60">Зал</p>

        <div className="absolute left-1/2 top-5 grid -translate-x-1/2 justify-items-center gap-1 text-gold">
          <DoorOpen className="h-5 w-5" aria-hidden="true" />
          <div className="grid w-24 gap-1">
            <span className="h-1 rounded-full bg-gold/85" />
            <span className="mx-3 h-1 rounded-full bg-gold/70" />
            <span className="mx-7 h-1 rounded-full bg-gold/55" />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.14em]">{mapCopy.entrance}</span>
        </div>

        <div className="absolute left-8 top-[72px] grid grid-cols-2 gap-2">
          {[60, 61, 70, 71].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-16 w-16" />
          ))}
        </div>

        <div className="absolute left-[44%] top-[74px] flex gap-3">
          {[40, 41, 42].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-16 w-16" />
          ))}
        </div>

        <div className="absolute right-9 top-[132px]">
          <TableButton table={t(80)} {...tableProps} className="h-32 w-20" />
        </div>

        <div className="absolute bottom-10 left-9">
          <TableButton table={t('VIP')} {...tableProps} className="h-28 w-24" />
        </div>

        <div className="booking-plan-fixture booking-bar-fixture absolute bottom-9 left-[24%] grid h-28 w-32 place-items-center text-2xl font-semibold text-cream">
          <span>{mapCopy.bar}</span>
        </div>

        <div className="absolute bottom-10 right-9 flex gap-2.5">
          {[50, 51, 52, 53, 54].map((number) => (
            <TableButton key={number} table={t(number)} {...tableProps} className="h-16 w-12" />
          ))}
        </div>
      </section>
    </div>
  );
}

function CenterMap({ tables, tableProps, activeArea }) {
  const filtered = tables.filter((table) => {
    if (activeArea === 'terrace') return table.zone === 'terrace';
    return table.zone !== 'terrace';
  });

  return (
    <div className="booking-floor-map relative mx-auto h-[420px] min-w-[720px] max-w-[900px] rounded-2xl border border-cream/15">
      <div className="absolute inset-8 border border-cream/20" />
      {filtered.map((table) => (
        <div
          key={table.id}
          className="absolute"
          style={{
            left: `${table.x}%`,
            top: `${table.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <TableButton
            table={table}
            {...tableProps}
            className={table.capacity >= 6 || table.number === 'VIP' ? 'h-16 w-20' : 'h-16 w-16'}
          />
        </div>
      ))}
    </div>
  );
}

export default function TableMap({
  branch,
  guestsCount = 1,
  reservedTableIds = [],
  selectedTableId = null,
  selectedTableIds = [],
  tableAnnotations = {},
  allowDisabledTableClick = false,
  onDisabledTableClick = () => {},
  onSelectTable = () => {},
  activeArea,
  onAreaChange = () => {},
}) {
  const { copy } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const mapCopy = copy.tableMap;
  const tables = getBranchTables(branch);
  const isRyscanovka = branch?.slug === 'ryscanovka';
  const area = activeArea ?? (isRyscanovka ? 'gazebo' : 'main');
  const areas = (isRyscanovka ? RYSCANOVKA_AREAS : CENTER_AREAS).map((item) => ({
    ...item,
    label: copy.areaLabels[item.id] ?? item.label,
  }));
  const branchName = copy.branches[branch?.slug]?.name ?? branch?.name ?? 'TIFLIS';
  const visibleTables = isRyscanovka
    ? tables.filter((table) => (area === 'restaurant' ? ['veranda', 'hall'].includes(table.zone) : table.zone === area))
    : tables;
  const tableProps = {
    guestsCount,
    reservedTableIds,
    selectedTableId,
    selectedTableIds,
    selectedTables: tables.filter((table) => selectedTableIds.includes(table.id)),
    tableAnnotations,
    allowDisabledTableClick,
    onDisabledTableClick,
    onSelectTable,
    mapCopy,
  };
  const ActiveIcon = AREA_ICONS[area] ?? Armchair;
  const selectedCount = selectedTableIds.length + (selectedTableId ? 1 : 0);
  const usesResponsiveMap =
    isRyscanovka &&
    (area === 'gazebo' ||
      (area === 'hookah' && USE_REFERENCE_HOOKAH_BACKGROUND) ||
      (area === 'restaurant' && USE_REFERENCE_RESTAURANT_BACKGROUND));
  const mapScrollClassName = [
    'booking-map-scroll pb-3',
    usesResponsiveMap ? 'booking-map-scroll-fit' : 'overflow-x-auto',
  ].join(' ');

  return (
    <section
      className={[
        'booking-map-panel overflow-hidden rounded-2xl p-4 sm:p-5',
        isRyscanovka && area === 'gazebo' ? 'booking-map-panel-gazebo' : '',
      ].join(' ')}
    >
      <AreaTabs areas={areas} activeArea={area} onAreaChange={onAreaChange} mapCopy={mapCopy} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={area}
          className="booking-area-transition"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.28, ease: [0.32, 0.72, 0, 1] }}
        >
      <div className="booking-map-heading-row mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="booking-zone-emblem">
            <ActiveIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold leading-none sm:text-3xl">
              {copy.areaLabels[area] ?? AREA_LABELS[area] ?? mapCopy.map} · {branchName}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-cream/70">
              {mapCopy.instructions}
            </p>
          </div>
        </div>
        <Legend selectedCount={selectedCount} mapCopy={mapCopy} />
      </div>

      <div className={mapScrollClassName}>
        {isRyscanovka && area === 'gazebo' ? (
          <GazeboMap tables={visibleTables} tableProps={tableProps} onAreaChange={onAreaChange} mapCopy={mapCopy} />
        ) : null}
        {isRyscanovka && area === 'hookah' ? <HookahMap tables={visibleTables} tableProps={tableProps} mapCopy={mapCopy} /> : null}
        {isRyscanovka && area === 'restaurant' ? (
          <RestaurantMap tables={visibleTables} tableProps={tableProps} mapCopy={mapCopy} />
        ) : null}
        {!isRyscanovka ? <CenterMap tables={tables} tableProps={tableProps} activeArea={area} /> : null}
      </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}


