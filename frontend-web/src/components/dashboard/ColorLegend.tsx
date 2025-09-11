import type { Lugar } from '../../types';

interface ColorLegendProps {
  lugares: Lugar[];
  getEventColor: (lugarId: number) => string;
}

export default function ColorLegend({
  lugares,
  getEventColor
}: ColorLegendProps) {
  if (lugares.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Leyenda de Lugares
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lugares.filter(l => l.activo !== false).map((lugar) => (
          <div key={lugar.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getEventColor(lugar.id) }}
            ></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {lugar.nombre}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
