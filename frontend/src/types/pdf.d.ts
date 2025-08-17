declare module 'jspdf' {
  export default class jsPDF {
    constructor(options?: any);
    setFont(fontName: string): void;
    setFontSize(size: number): void;
    setTextColor(r: number, g: number, b: number): void;
    text(text: string, x: number, y: number, options?: any): void;
    save(filename: string): void;
    internal: {
      pageSize: {
        height: number;
        width: number;
      };
    };
    getNumberOfPages(): number;
    setPage(pageNumber: number): void;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: string[][];
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: any;
    didDrawPage?: (data: any) => void;
  }

  function autoTable(doc: any, options: AutoTableOptions): void;
  export default autoTable;
}
