import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ totalPosts:number, posts:Post[] }>();

  constructor(private _http: HttpClient, private router: Router) { }

  getPosts(postsPerPage:number, currentPage:number): void{
    const queryParams:string = `?pageSize=${postsPerPage}&page=${currentPage}`;
    this._http.get<{ message: string, posts: Post[], totalPosts:number }>(`${environment.apiUrl}/posts${queryParams}`).pipe(map((postData) => {
      postData.posts = postData.posts.map((post: any) => {
        return {
          id: post._id,
          title: post.title,
          content: post.content,
          imagePath: post.imagePath,
          creator: post.creator
        }
      });
      return postData;
    }))
    .subscribe((postData) => {
      this.posts = postData.posts;
      this.postsUpdated.next({ totalPosts: postData.totalPosts, posts: [...this.posts] });
    });
  }

  getPostUpdateListner() {
    return this.postsUpdated.asObservable();
  }

  getPost(id:string) {
    return this._http.get<{ _id:string, title:string, content:string, imagePath:string, creator:string }>(`${environment.apiUrl}/posts/${id}`);
  }

  addPost(title:string, content:string, image:File){
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this._http.post<{ message: string, post: Post }>(`${environment.apiUrl}/posts`, postData).subscribe((responseData) => {
      // not needed code.........
      // console.log(responseData);
      // const post:Post = { id: responseData.post.id, title: title, content: content, imagePath: responseData.post.imagePath };
      // this.posts.push(post);
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  updatePost(id: string, title:string, content:string, image: File | string){
    let postData: Post | FormData;
    if(typeof(image) === 'object'){
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    }else{
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null
      };
    }
    this._http.put<{ message: string }>(`${environment.apiUrl}/posts/${id}`, postData).subscribe(res => {
      console.log(res);
      // not needed now
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex( p => p.id === id);
      // const post:Post = {
      //   id: id,
      //   title: title,
      //   content: content,
      //   imagePath: ''
      // }
      // updatedPosts[oldPostIndex] = post;
      // this.posts = updatedPosts;
      // this.postsUpdated.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this._http.delete<{ message: string, result: any}>(`${environment.apiUrl}/posts/${postId}`);
    // not needed now because i updated this code........
    // subscribe(res => {
    //   const updatedPost = this.posts.filter(post => post.id !== postId);
    //   this.posts = updatedPost;
    //   this.postsUpdated.next([...this.posts]);
    // });
  }

}
