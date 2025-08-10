import { Request, Response } from 'express';
import { Test } from '../models';

export const getAllTests = async (req: Request, res: Response) => {
  try {
    const tests = await Test.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error al obtener tests:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'El campo message es requerido'
      });
    }

    const test = await Test.create({ message });
    
    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Error al crear test:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
