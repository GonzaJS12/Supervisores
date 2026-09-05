import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type {
  SupervisionListado,
} from '../types/supervision';

interface ExportarSupervisionesPdfParams {
  supervisiones: SupervisionListado[];
  titulo: string;
  nombreArchivo: string;
  supervisor?: string;
}

export const exportarSupervisionesPdf = ({
  supervisiones,
  titulo,
  nombreArchivo,
  supervisor,
}: ExportarSupervisionesPdfParams) => {
  const documento = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  /*
   * ENCABEZADO
   */

  documento.setFontSize(18);

  documento.text(
    'Sistema de Supervisión de Agentes Sanitarios',
    14,
    16,
  );

  documento.setFontSize(13);

  documento.text(
    titulo,
    14,
    25,
  );

  documento.setFontSize(9);

  let posicionY = 32;

  if (supervisor) {
    documento.text(
      `Supervisor: ${supervisor}`,
      14,
      posicionY,
    );

    posicionY += 5;
  }

  documento.text(
    `Fecha de generación: ${formatearFechaHora(
      new Date(),
    )}`,
    14,
    posicionY,
  );

  posicionY += 5;

  documento.text(
    `Total de supervisiones: ${supervisiones.length}`,
    14,
    posicionY,
  );

  /*
   * TABLA
   */

  autoTable(documento, {
    startY: posicionY + 7,

    head: [
      [
        'Fecha',
        'Agente',
        'Documento',
        'Legajo',
        'Área',
        'Sector',
        'Supervisor',
        'Promedio',
        'Clasificación',
        'Gestión',
      ],
    ],

    body: supervisiones.map(
      (supervision) => [
        formatearFecha(
          supervision.fecha,
        ),

        `${supervision.agenteSanitario.apellido}, ${supervision.agenteSanitario.nombre}`,

        supervision.agenteSanitario
          .documento ?? '-',

        supervision.agenteSanitario
          .legajo ?? '-',

        supervision.areaOperativa
          .nombre,

        supervision.sector.nombre ??
          `Sector ${
            supervision.sector.numero ??
            ''
          }`,

        `${supervision.supervisor.nombre} ${supervision.supervisor.apellido}`,

        supervision.promedio !== null &&
        supervision.promedio !== undefined
          ? Number(
              supervision.promedio,
            ).toFixed(2)
          : '-',

        formatearClasificacion(
          supervision.clasificacion,
        ),

        formatearDecision(
          supervision.decisionGestion,
        ),
      ],
    ),

    styles: {
      fontSize: 7,
      cellPadding: 2,
      valign: 'middle',
    },

    headStyles: {
      fontStyle: 'bold',
    },

    margin: {
      left: 10,
      right: 10,
    },

    didDrawPage: (data) => {
      const numeroPagina =
        documento.getNumberOfPages();

      documento.setFontSize(8);

      documento.text(
        `Página ${numeroPagina}`,
        documento.internal.pageSize.getWidth() -
          25,
        documento.internal.pageSize.getHeight() -
          7,
      );

      if (data.pageNumber > 1) {
        documento.setFontSize(9);

        documento.text(
          titulo,
          14,
          10,
        );
      }
    },
  });

  const fechaArchivo =
    new Date()
      .toISOString()
      .slice(0, 10);

  documento.save(
    `${nombreArchivo}-${fechaArchivo}.pdf`,
  );
};

function formatearFecha(
  fecha: string,
): string {
  return new Intl.DateTimeFormat(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(
    new Date(fecha),
  );
}

function formatearFechaHora(
  fecha: Date,
): string {
  return new Intl.DateTimeFormat(
    'es-AR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(fecha);
}

function formatearDecision(
  decision: string,
): string {
  const etiquetas:
    Record<string, string> = {
      NO_REQUIERE:
        'No requiere',

      SEGUIMIENTO:
        'Seguimiento',

      CAPACITACION:
        'Capacitación',

      SUPERVISION_INTENSIVA:
        'Supervisión intensiva',
    };

  return (
    etiquetas[decision] ??
    decision
  );
}

function formatearClasificacion(
  clasificacion?: string | null,
): string {
  const etiquetas:
    Record<string, string> = {
      CRITICO: 'Crítico',
      REGULAR: 'Regular',
      BUENO: 'Bueno',
      EXCELENTE: 'Excelente',
    };

  if (!clasificacion) {
    return '-';
  }

  return (
    etiquetas[clasificacion] ??
    clasificacion
  );
}