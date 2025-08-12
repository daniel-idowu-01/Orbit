import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor() {}
  
  async getUserById(id: string): Promise<any> {
    return { id, name: 'John Doe' };
  }
}
