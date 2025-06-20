import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export const getSectorManagers = async (req: Request, res: Response) => {
  try {
    const sectorManagers = await prisma.user.findMany({
      where: {
        role: UserRole.SECTOR_MANAGER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(sectorManagers);
  } catch (error) {
    console.error('Erreur lors de la récupération des chefs de secteur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des chefs de secteur' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
}; 