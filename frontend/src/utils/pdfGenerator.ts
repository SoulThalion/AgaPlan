import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TurnoForPDF {
  id: number;
  fecha: string;
  hora: string;
  lugar: {
    nombre: string;
    direccion: string;
    capacidad?: number;
  };
  exhibidores?: Array<{
    nombre: string;
    descripcion?: string;
  }>;
  usuarios?: Array<{
    id: number;
    nombre: string;
    cargo: string;
    tieneCoche: boolean;
  }>;
}

export const generateTurnosPDF = (turnos: TurnoForPDF[], title: string = 'Calendario de Turnos') => {
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configurar fuente y colores
  doc.setFont('helvetica');
  doc.setFontSize(20);
  
  // Título principal
  doc.setTextColor(44, 62, 80);
  doc.text(title, 20, 30);
  
  // Fecha de generación
  doc.setFontSize(12);
  doc.setTextColor(127, 140, 141);
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generado el: ${fechaGeneracion}`, 20, 45);
  
  // Preparar datos para la tabla
  const tableData = turnos.map(turno => {
    const fecha = new Date(turno.fecha).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
    
    const hora = turno.hora.includes('-') 
      ? turno.hora.split('-').join(' - ')
      : turno.hora;
    
    const lugar = turno.lugar.nombre;
    
    const exhibidores = turno.exhibidores && turno.exhibidores.length > 0
      ? turno.exhibidores.map(e => e.nombre).join(', ')
      : 'Sin exhibidores';
    
    const voluntarios = turno.usuarios && turno.usuarios.length > 0
      ? turno.usuarios.map(u => `${u.nombre}${u.tieneCoche ? ' 🚗' : ''}`).join(', ')
      : 'Sin voluntarios';
    
    const capacidad = turno.lugar.capacidad 
      ? `${turno.usuarios?.length || 0}/${turno.lugar.capacidad}`
      : '∞';
    
    return [fecha, hora, lugar, exhibidores, voluntarios, capacidad];
  });
  
  // Si no hay turnos, mostrar mensaje
  if (tableData.length === 0) {
    doc.setFontSize(14);
    doc.setTextColor(127, 140, 141);
    doc.text('No hay turnos para mostrar', 20, 80);
    doc.save(`turnos_${new Date().toISOString().split('T')[0]}.pdf`);
    return;
  }
  
  // Configurar tabla
  const tableConfig = {
    startY: 60,
    head: [
      ['Fecha', 'Horario', 'Lugar', 'Exhibidores', 'Voluntarios', 'Ocupación']
    ],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' }, // Fecha
      1: { cellWidth: 25, halign: 'center' }, // Horario
      2: { cellWidth: 35, halign: 'left' },   // Lugar
      3: { cellWidth: 30, halign: 'left' },   // Exhibidores
      4: { cellWidth: 40, halign: 'left' },   // Voluntarios
      5: { cellWidth: 20, halign: 'center' }, // Ocupación
    },
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    didDrawPage: function(data: any) {
      // Agregar número de página en cada página
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(127, 140, 141);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('AgaPlan - Sistema de Gestión de Turnos', doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  };
  
  // Generar tabla usando autoTable directamente
  autoTable(doc, tableConfig);
  
  // Agregar estadísticas al final
  const finalY = (doc as any).lastAutoTable?.finalY || 60;
  const statsY = finalY + 20;
  
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('📊 Resumen:', 20, statsY);
  
  const totalTurnos = turnos.length;
  const totalVoluntarios = turnos.reduce((sum, t) => sum + (t.usuarios?.length || 0), 0);
  const totalExhibidores = turnos.reduce((sum, t) => sum + (t.exhibidores?.length || 0), 0);
  const turnosCompletos = turnos.filter(t => 
    t.lugar.capacidad && t.usuarios && t.usuarios.length >= t.lugar.capacidad
  ).length;
  
  doc.setFontSize(10);
  doc.setTextColor(127, 140, 141);
  doc.text(`• Total de turnos: ${totalTurnos}`, 25, statsY + 15);
  doc.text(`• Total de voluntarios asignados: ${totalVoluntarios}`, 25, statsY + 25);
  doc.text(`• Total de exhibidores: ${totalExhibidores}`, 25, statsY + 35);
  doc.text(`• Turnos completos: ${turnosCompletos}/${totalTurnos}`, 25, statsY + 45);
  
  // Guardar PDF
  const fileName = `turnos_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Función para generar PDF solo de mis turnos
export const generateMyTurnosPDF = (turnos: TurnoForPDF[], userName: string) => {
  const title = `Mis Turnos - ${userName}`;
  generateTurnosPDF(turnos, title);
};

// Función para generar PDF de turnos de esta semana
export const generateWeekTurnosPDF = (turnos: TurnoForPDF[]) => {
  const title = 'Turnos de Esta Semana';
  generateTurnosPDF(turnos, title);
};
