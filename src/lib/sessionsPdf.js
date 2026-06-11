import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDuration } from './sessions';

const METHOD_LABELS = {
  google:   'Google',
  facebook: 'Facebook',
  github:   'GitHub',
  password: 'Email/Pass',
};

const formatDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
};

// Genera y descarga un PDF con las sesiones visibles (ya filtradas en pantalla).
// `filters` describe los filtros aplicados para dejarlos documentados en el reporte.
export function exportSessionsPdf(sessions, filters = {}) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.text('Tu Mejor Versión Shop — Auditoría de Sesiones', 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(110);
  const generated = new Date().toLocaleString('es-CO', { dateStyle: 'full', timeStyle: 'short' });
  doc.text(`Generado: ${generated}`, 14, 23);

  const activeFilters = [];
  if (filters.search)  activeFilters.push(`Búsqueda: "${filters.search}"`);
  if (filters.method)  activeFilters.push(`Método: ${METHOD_LABELS[filters.method] || filters.method}`);
  if (filters.status)  activeFilters.push(`Estado: ${filters.status === 'active' ? 'Activa' : 'Finalizada'}`);
  if (filters.from)    activeFilters.push(`Desde: ${filters.from}`);
  if (filters.to)      activeFilters.push(`Hasta: ${filters.to}`);
  doc.text(
    activeFilters.length > 0 ? `Filtros aplicados: ${activeFilters.join(' · ')}` : 'Sin filtros (todos los registros)',
    14,
    28
  );

  autoTable(doc, {
    startY: 33,
    head: [['Usuario', 'Correo', 'Método', 'Hora de ingreso', 'Hora de salida', 'Duración', 'Estado']],
    body: sessions.map((s) => [
      s.displayName || '—',
      s.email || '—',
      METHOD_LABELS[s.method] || s.method || '—',
      formatDate(s.loginAt),
      formatDate(s.logoutAt),
      formatDuration(s.durationMs),
      s.status === 'active' ? 'Activa' : 'Finalizada',
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [122, 184, 48], textColor: [10, 10, 10], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 240] },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `${sessions.length} registro(s) — Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`auditoria-sesiones-${new Date().toISOString().slice(0, 10)}.pdf`);
}
