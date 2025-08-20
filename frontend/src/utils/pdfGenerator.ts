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

export const generateTurnosPDF = (turnos: TurnoForPDF[], title: string = 'Calendario de Turnos', mes?: number, año?: number, debug: boolean = false) => {
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Configurar fuente y colores
  doc.setFont('helvetica');
  doc.setFontSize(20);
  
  // Título principal
  doc.setTextColor(44, 62, 80);
  doc.text(title, 20, 30);
  
  // Agregar mes y año si están disponibles
  if (mes !== undefined && año !== undefined) {
    const nombresMeses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
    doc.text(`${nombresMeses[mes]} ${año}`, 20, 50);
  }
  
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
  
  // Ajustar posición de la fecha de generación según si hay mes/año
  const fechaY = mes !== undefined && año !== undefined ? 65 : 45;
  doc.text(`Generado el: ${fechaGeneracion}`, 20, fechaY);
  
  // Función para depurar caracteres problemáticos
  const debugCaracteres = (texto: string, etiqueta: string): string => {
    if (!texto) return 'Sin texto';
    
    if (debug) {
      // Log para depuración solo si está activado
      console.log(`${etiqueta} original:`, texto);
      console.log(`${etiqueta} códigos:`, Array.from(texto).map(char => char.charCodeAt(0)));
    }
    
    return texto;
  };
  
  // Función para limpiar y normalizar nombres
  const limpiarNombre = (nombre: string): string => {
    if (!nombre) return 'Sin nombre';
    
    // Normalizar caracteres especiales
    let nombreLimpio = nombre
      .normalize('NFD') // Normalizar a forma de descomposición
      .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos (acentos)
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Caracteres de control
      .replace(/[^\w\s]/g, '') // Solo letras, números y espacios
      .trim();
    
    // Si después de limpiar no queda nada, usar un nombre por defecto
    if (!nombreLimpio) {
      return 'Sin nombre';
    }
    
    // Capitalizar primera letra de cada palabra
    nombreLimpio = nombreLimpio.replace(/\b\w/g, (char) => char.toUpperCase());
    
    return nombreLimpio;
  };
  
  // Función alternativa para preservar acentos si es posible
  const limpiarNombreConAcentos = (nombre: string): string => {
    if (!nombre) return 'Sin nombre';
    
    try {
      // Intentar preservar acentos pero limpiar caracteres problemáticos
      let nombreLimpio = nombre
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Solo caracteres de control
        .replace(/[^\w\sáéíóúñÁÉÍÓÚÑüÜ]/g, '') // Letras, números, espacios y acentos españoles
        .trim();
      
      // Si después de limpiar no queda nada, usar la función más estricta
      if (!nombreLimpio) {
        return limpiarNombre(nombre);
      }
      
      // Capitalizar primera letra de cada palabra
      nombreLimpio = nombreLimpio.replace(/\b\w/g, (char) => char.toUpperCase());
      
      return nombreLimpio;
    } catch (error) {
      console.error('Error limpiando nombre:', nombre, error);
      return limpiarNombre(nombre); // Fallback a la función más estricta
    }
  };
  
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
    
    const lugar = debugCaracteres(limpiarNombreConAcentos(turno.lugar.nombre), 'Lugar');
    
    const exhibidores = turno.exhibidores && turno.exhibidores.length > 0
      ? turno.exhibidores.map(e => debugCaracteres(limpiarNombreConAcentos(e.nombre), 'Exhibidor')).join(', ')
      : 'Sin exhibidores';
    
                const voluntarios = turno.usuarios && turno.usuarios.length > 0
              ? turno.usuarios.map(u => {
                  const nombreLimpio = debugCaracteres(limpiarNombreConAcentos(u.nombre), 'Usuario');
                  return nombreLimpio;
                }).join(', ')
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
    const mensajeY = mes !== undefined && año !== undefined ? 100 : 80;
    doc.text('No hay turnos para mostrar', 20, mensajeY);
    
    // Generar nombre de archivo con mes y año si están disponibles
    let fileName = 'turnos';
    if (mes !== undefined && año !== undefined) {
      const nombresMeses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      fileName = `turnos_${nombresMeses[mes]}_${año}`;
    } else {
      fileName = `turnos_${new Date().toISOString().split('T')[0]}`;
    }
    doc.save(`${fileName}.pdf`);
    return;
  }
  
  // Configurar tabla
  const tableConfig = {
    startY: mes !== undefined && año !== undefined ? 80 : 60,
    head: [
      ['Fecha', 'Horario', 'Lugar', 'Exhibidores', 'Voluntarios', 'Ocupación']
    ],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left',
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [52, 73, 94],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
      font: 'helvetica'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' }, // Fecha
      1: { cellWidth: 25, halign: 'center' }, // Horario
      2: { cellWidth: 35, halign: 'left' },   // Lugar
      3: { cellWidth: 30, halign: 'left' },   // Exhibidores
      4: { cellWidth: 50, halign: 'left' },   // Voluntarios (aumentado para acomodar más información)
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
  const finalY = (doc as any).lastAutoTable?.finalY || (mes !== undefined && año !== undefined ? 80 : 60);
  const statsY = finalY + 20;
  
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text('Resumen:', 20, statsY);
  
  const totalTurnos = turnos.length;
  const totalVoluntarios = turnos.reduce((sum, t) => sum + (t.usuarios?.length || 0), 0);
  const totalExhibidores = turnos.reduce((sum, t) => sum + (t.exhibidores?.length || 0), 0);
  const turnosCompletos = turnos.filter(t => 
    t.lugar.capacidad && t.usuarios && t.usuarios.length >= t.lugar.capacidad
  ).length;
  
  doc.setFontSize(10);
  doc.setTextColor(127, 140, 141);
  doc.text(`Total de turnos: ${totalTurnos}`, 25, statsY + 15);
  doc.text(`Total de voluntarios asignados: ${totalVoluntarios}`, 25, statsY + 25);
  doc.text(`Total de exhibidores: ${totalExhibidores}`, 25, statsY + 35);
  doc.text(`Turnos completos: ${turnosCompletos}/${totalTurnos}`, 25, statsY + 45);
  
  // Generar nombre de archivo con mes y año si están disponibles
  let fileName = 'turnos';
  if (mes !== undefined && año !== undefined) {
    const nombresMeses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    fileName = `turnos_${nombresMeses[mes]}_${año}`;
  } else {
    fileName = `turnos_${new Date().toISOString().split('T')[0]}`;
  }
  doc.save(`${fileName}.pdf`);
};

// Función para generar PDF solo de mis turnos
export const generateMyTurnosPDF = (turnos: TurnoForPDF[], userName: string, mes?: number, año?: number, debug: boolean = false) => {
  const title = `Mis Turnos - ${userName}`;
  generateTurnosPDF(turnos, title, mes, año, debug);
};

// Función para generar PDF de turnos de esta semana
export const generateWeekTurnosPDF = (turnos: TurnoForPDF[], mes?: number, año?: number, debug: boolean = false) => {
  const title = 'Turnos de Esta Semana';
  generateTurnosPDF(turnos, title, mes, año, debug);
};
