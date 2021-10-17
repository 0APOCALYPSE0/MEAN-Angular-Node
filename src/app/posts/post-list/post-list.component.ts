import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts:Post[] = [];
  isLoading:boolean = false;
  totalPosts:number = 0;
  postsPerPage:number = 5;
  currentPage:number = 1;
  pageSizeOptions:number[] = [5,10,15,20,25];
  postsSubscription: Subscription = new Subscription;
  userIsAuthenticated:boolean = false;
  userId:string;
  private authListenerSubs:Subscription;

  constructor(private postsService:PostsService, private authService:AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSubscription = this.postsService.getPostUpdateListner().subscribe((postsData:{ totalPosts: number, posts: Post[]}) => {
      this.isLoading = false;
      this.posts = postsData.posts;
      this.totalPosts = postsData.totalPosts;
    });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    });
  }

  onDelete(postId: string): void{
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    },
    () => {
      this.isLoading = false;
    });
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex+1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(): void{
    this.postsSubscription.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }

}
