import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post(':taskId')
  addComment(
    @Param('taskId') taskId: string,
    @Body('content') content: string,
    @GetUser('_id') userId: string,
  ) {
    return this.commentService.addComment(taskId, content, userId);
  }

  @Get(':taskId')
  getComments(@Param('taskId') taskId: string, @GetUser('_id') userId: string) {
    return this.commentService.getComments(taskId, userId);
  }
}
