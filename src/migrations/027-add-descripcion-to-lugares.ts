import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Agregando campo descripcion a la tabla lugares...');
  
  try {
    // Verificar si la columna descripcion ya existe
    const [rows] = await queryInterface.sequelize.query("SHOW FULL COLUMNS FROM `lugares`;") as any[];
    const existingColumns = new Set(rows.map((row: any) => row.Field));

    if (!existingColumns.has('descripcion')) {
      console.log('📋 Agregando columna descripcion...');
      await queryInterface.addColumn('lugares', 'descripcion', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción del lugar'
      });
      console.log('✅ Columna descripcion agregada');
    } else {
      console.log('✅ Columna descripcion ya existe, saltando...');
    }

    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Revertiendo campo descripcion de la tabla lugares...');
  await queryInterface.removeColumn('lugares', 'descripcion');
  console.log('✅ Campo descripcion revertido exitosamente');
}
