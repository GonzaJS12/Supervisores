import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearAgente } from '../../services/agentes.service';
import { obtenerAreasOperativas, type AreaOperativa} from '../../services/areas-operativas.service';

export default function NuevoAgentePage() {
  const navigate = useNavigate();

  const [areas, setAreas] = useState<AreaOperativa[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    legajo: '',
    areaOperativaId: '',
  });

  useEffect(() => {
    const cargarAreas = async () => {
      try {
        const datos = await obtenerAreasOperativas();
        setAreas(datos);
      } catch (error) {
        console.error(error);
        setError(
          'No se pudieron cargar las áreas operativas.',
        );
      }
    };

    cargarAreas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError('');
    setCargando(true);

    try {
      await crearAgente({
        nombre: form.nombre,
        apellido: form.apellido,
        documento:
          form.documento.trim() || undefined,
        legajo:
          form.legajo.trim() || undefined,
        areaOperativaId: Number(
          form.areaOperativaId,
        ),
      });

      navigate('/agentes');
    } catch (error) {
      console.error(error);

      setError(
        'No se pudo registrar el agente sanitario.',
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Nuevo agente sanitario
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Complete los datos del agente.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">

          <Campo
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <Campo
            label="Apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
          />

          <Campo
            label="Documento"
            name="documento"
            value={form.documento}
            onChange={handleChange}
          />

          <Campo
            label="Legajo"
            name="legajo"
            value={form.legajo}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Área operativa
            </label>

            <select
              name="areaOperativaId"
              value={form.areaOperativaId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Seleccione un área
              </option>

              {areas.map((area) => (
                <option
                  key={area.id}
                  value={area.id}
                >
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate('/agentes')}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando
              ? 'Guardando...'
              : 'Guardar agente'}
          </button>

        </div>
      </form>
    </div>
  );
}

interface CampoProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

function Campo({
  label,
  name,
  value,
  required,
  onChange,
}: CampoProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}