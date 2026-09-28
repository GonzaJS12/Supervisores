import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, MapPinned, Search } from 'lucide-react';

import {
  obtenerAreasOperativas,
  type AreaOperativa,
} from '../../services/areas-operativas.service';
import { obtenerSectores } from '../../services/sectores.service';
import { obtenerZonas, type Zona } from '../../services/zonas.service';
import type { Sector } from '../../types/supervision';
import { obtenerMensajeError } from '../../utils/http-error';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
} from '../../components/ui/FeedbackBlock';
import PageHeader from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/FormField';
import TableShell, {
  Table,
  THead,
  Th,
  TBody,
  Tr,
  Td,
} from '../../components/ui/TableShell';

type TabTerritorio = 'jerarquia' | 'zonas' | 'areas' | 'sectores';

export default function TerritorioPage() {
  const [tab, setTab] = useState<TabTerritorio>('jerarquia');
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [areas, setAreas] = useState<AreaOperativa[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [zonasAbiertas, setZonasAbiertas] = useState<Record<number, boolean>>(
    {},
  );
  const [areasAbiertas, setAreasAbiertas] = useState<Record<number, boolean>>(
    {},
  );

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        setError('');
        const [zonasData, areasData, sectoresData] = await Promise.all([
          obtenerZonas(),
          obtenerAreasOperativas(),
          obtenerSectores(),
        ]);
        setZonas(zonasData);
        setAreas(areasData);
        setSectores(sectoresData);

        const openZonas: Record<number, boolean> = {};
        zonasData.slice(0, 3).forEach((z) => {
          openZonas[z.id] = true;
        });
        setZonasAbiertas(openZonas);
      } catch (err) {
        setError(
          obtenerMensajeError(
            err,
            'No se pudo cargar la información territorial.',
          ),
        );
      } finally {
        setCargando(false);
      }
    };

    void cargar();
  }, []);

  const texto = busqueda.trim().toLowerCase();

  const zonasFiltradas = useMemo(() => {
    if (!texto) return zonas;
    return zonas.filter((z) =>
      `${z.nombre} ${z.codigo ?? ''}`.toLowerCase().includes(texto),
    );
  }, [zonas, texto]);

  const areasFiltradas = useMemo(() => {
    if (!texto) return areas;
    return areas.filter((a) =>
      `${a.nombre} ${a.zona?.nombre ?? ''} ${a.estabBase ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }, [areas, texto]);

  const sectoresFiltrados = useMemo(() => {
    if (!texto) return sectores;
    return sectores.filter((s) =>
      `${s.nombre ?? ''} ${s.numero} ${s.cobertura ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  }, [sectores, texto]);

  const jerarquia = useMemo(() => {
    const areasPorZona = new Map<number | 'sin', AreaOperativa[]>();
    for (const area of areas) {
      const key = area.zona?.id ?? ('sin' as const);
      const list = areasPorZona.get(key) ?? [];
      list.push(area);
      areasPorZona.set(key, list);
    }

    const sectoresPorArea = new Map<number, Sector[]>();
    for (const sector of sectores) {
      const key = sector.areaOperativaId;
      const list = sectoresPorArea.get(key) ?? [];
      list.push(sector);
      sectoresPorArea.set(key, list);
    }

    const match = (parts: string[]) => {
      if (!texto) return true;
      return parts.join(' ').toLowerCase().includes(texto);
    };

    return zonas
      .map((zona) => {
        const areasZona = (areasPorZona.get(zona.id) ?? []).filter((area) => {
          const secs = sectoresPorArea.get(area.id) ?? [];
          return (
            match([zona.nombre, area.nombre]) ||
            secs.some((s) =>
              match([
                zona.nombre,
                area.nombre,
                s.nombre ?? '',
                String(s.numero),
              ]),
            )
          );
        });

        if (texto && areasZona.length === 0 && !match([zona.nombre])) {
          return null;
        }

        return {
          zona,
          areas: areasZona.map((area) => ({
            area,
            sectores: (sectoresPorArea.get(area.id) ?? []).filter((s) =>
              texto
                ? match([
                    zona.nombre,
                    area.nombre,
                    s.nombre ?? '',
                    String(s.numero),
                  ]) || match([zona.nombre, area.nombre])
                : true,
            ),
          })),
        };
      })
      .filter(Boolean) as Array<{
      zona: Zona;
      areas: Array<{ area: AreaOperativa; sectores: Sector[] }>;
    }>;
  }, [zonas, areas, sectores, texto]);

  const tabs = [
    ['jerarquia', 'Jerarquía'],
    ['zonas', `Zonas (${zonas.length})`],
    ['areas', `Áreas (${areas.length})`],
    ['sectores', `Sectores (${sectores.length})`],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Territorio"
        description="Consulta de zonas, áreas operativas y sectores (solo lectura)."
      />

      {error ? (
        <ErrorBanner
          title="No se pudo cargar el territorio"
          message={error}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                tab === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código…"
            className="pl-9"
          />
        </div>
      </div>

      {cargando ? (
        <LoadingState
          title="Cargando territorio…"
          message="Obteniendo zonas, áreas y sectores."
        />
      ) : tab === 'jerarquia' ? (
        jerarquia.length === 0 ? (
          <EmptyState
            title="Sin datos"
            message="No hay territorio para mostrar."
          />
        ) : (
          <div className="space-y-3">
            {jerarquia.map(({ zona, areas: areasZona }) => {
              const abierta = zonasAbiertas[zona.id] ?? false;
              return (
                <Card key={zona.id} padding={false} className="overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setZonasAbiertas((prev) => ({
                        ...prev,
                        [zona.id]: !abierta,
                      }))
                    }
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 sm:px-5"
                  >
                    {abierta ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <MapPinned className="h-4 w-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        Zona · {zona.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {zona.codigo ? `Código ${zona.codigo} · ` : ''}
                        {areasZona.length} área(s)
                      </p>
                    </div>
                  </button>

                  {abierta && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-3 sm:px-5">
                      {areasZona.length === 0 ? (
                        <p className="px-2 py-2 text-sm text-slate-500">
                          Sin áreas en esta zona.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {areasZona.map(({ area, sectores: secs }) => {
                            const areaOpen = areasAbiertas[area.id] ?? false;
                            return (
                              <div
                                key={area.id}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAreasAbiertas((prev) => ({
                                      ...prev,
                                      [area.id]: !areaOpen,
                                    }))
                                  }
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
                                >
                                  {areaOpen ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800">
                                      Área · {area.nombre}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {area.estabBase
                                        ? `${area.estabBase} · `
                                        : ''}
                                      {secs.length} sector(es)
                                    </p>
                                  </div>
                                  <StatusBadge activo={area.activo} />
                                </button>

                                {areaOpen && (
                                  <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2">
                                    {secs.length === 0 ? (
                                      <p className="px-2 py-1 text-xs text-slate-500">
                                        Sin sectores.
                                      </p>
                                    ) : (
                                      <ul className="space-y-1">
                                        {secs.map((s) => (
                                          <li
                                            key={s.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700"
                                          >
                                            <span>
                                              <span className="text-slate-400">
                                                Sector ·{' '}
                                              </span>
                                              {s.nombre ?? `Nº ${s.numero}`}
                                              {s.cobertura
                                                ? ` · ${s.cobertura}`
                                                : ''}
                                            </span>
                                            <StatusBadge activo={s.activo} />
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <TableShell>
          {tab === 'zonas' && (
            <Tabla
              vacio="No hay zonas para mostrar."
              encabezados={['Nombre', 'Código', 'ID externo']}
              filas={zonasFiltradas.map((z) => [
                z.nombre,
                z.codigo ?? '-',
                z.externalZonaId ?? '-',
              ])}
            />
          )}
          {tab === 'areas' && (
            <Tabla
              vacio="No hay áreas operativas para mostrar."
              encabezados={[
                'Nombre',
                'Zona',
                'Establecimiento base',
                'Estado',
              ]}
              filas={areasFiltradas.map((a) => [
                a.nombre,
                a.zona?.nombre ?? '-',
                a.estabBase ?? '-',
                a.activo ? 'Activa' : 'Inactiva',
              ])}
            />
          )}
          {tab === 'sectores' && (
            <Tabla
              vacio="No hay sectores para mostrar."
              encabezados={[
                'Número',
                'Nombre',
                'Área operativa',
                'Cobertura',
                'Estado',
              ]}
              filas={sectoresFiltrados.map((s) => [
                s.numero,
                s.nombre ?? '-',
                s.areaOperativa?.nombre ?? s.areaOperativaId,
                s.cobertura ?? '-',
                s.activo ? 'Activo' : 'Inactivo',
              ])}
            />
          )}
        </TableShell>
      )}
    </div>
  );
}

function Tabla({
  encabezados,
  filas,
  vacio,
}: {
  encabezados: string[];
  filas: Array<Array<string | number>>;
  vacio: string;
}) {
  if (filas.length === 0) {
    return (
      <EmptyState
        className="m-4 border-0 bg-transparent shadow-none"
        title="Sin datos"
        message={vacio}
      />
    );
  }

  return (
    <Table>
      <THead>
        <tr>
          {encabezados.map((h) => (
            <Th key={h}>{h}</Th>
          ))}
        </tr>
      </THead>
      <TBody>
        {filas.map((fila, idx) => (
          <Tr key={idx}>
            {fila.map((celda, cidx) => (
              <Td key={cidx}>{celda}</Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}
