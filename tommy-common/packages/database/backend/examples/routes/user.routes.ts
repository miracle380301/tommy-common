import { Router, Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';

export function createUserRoutes(userRepository: UserRepository): Router {
  const router = Router();

  /**
   * GET /users - 모든 사용자 조회
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { limit, offset, orderBy } = req.query;
      const users = await userRepository.findAll({
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        orderBy: orderBy as string
      });
      res.json({ success: true, data: users, count: users.length });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * GET /users/:id - ID로 사용자 조회
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;  // MongoDB: string, SQLite: number string
      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * GET /users/email/:email - 이메일로 사용자 조회
   */
  router.get('/email/:email', async (req: Request, res: Response) => {
    try {
      const user = await userRepository.findByEmail(req.params.email);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * GET /users/search/name - 이름으로 사용자 검색
   */
  router.get('/search/name', async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({ success: false, error: 'Query parameter "q" is required' });
      }

      const users = await userRepository.findByName(q as string);
      res.json({ success: true, data: users, count: users.length });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * POST /users - 사용자 생성
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      console.log('@@ /users : req.body', req.body);
      const { name, email, age } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required'
        });
      }

      // 이메일 중복 체크
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      const user = await userRepository.create({ name, email, age });
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * PUT /users/:id - 사용자 업데이트
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;  // MongoDB: string, SQLite: number string
      const { name, email, age } = req.body;

      // 이메일 변경 시 중복 체크
      if (email) {
        const existingUser = await userRepository.findByEmail(email);
        // MongoDB는 string, SQLite는 number로 비교
        if (existingUser && String(existingUser.id) !== String(id)) {
          return res.status(409).json({
            success: false,
            error: 'Email already exists'
          });
        }
      }

      const user = await userRepository.update(id, { name, email, age });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * DELETE /users/:id - 사용자 삭제
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;  // MongoDB: string, SQLite: number string
      const success = await userRepository.delete(id);

      if (!success) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  /**
   * GET /stats/count - 사용자 수 조회
   */
  router.get('/stats/count', async (req: Request, res: Response) => {
    try {
      const count = await userRepository.count();
      res.json({ success: true, count });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  return router;
}
