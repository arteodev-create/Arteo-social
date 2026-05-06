import { PostService } from '@services/post.service';

export const postApi = {
  getFeed: PostService.getFeed,
  getPosts: PostService.getPosts,
  getPost: PostService.getPost,
  getUserPosts: PostService.getUserPosts,
  getComments: PostService.getComments,
  createPost: PostService.createPost,
  createComment: PostService.createComment,
  quotePost: PostService.quotePost,
  deletePost: PostService.deletePost,
  votePoll: PostService.votePoll,
  likePost: PostService.likePost,
  unlikePost: PostService.unlikePost,
  toggleRepost: PostService.toggleRepost,
  repostPost: PostService.repostPost,
  unrepostPost: PostService.unrepostPost,
  bookmarkPost: PostService.bookmarkPost,
  unbookmarkPost: PostService.unbookmarkPost,
};
