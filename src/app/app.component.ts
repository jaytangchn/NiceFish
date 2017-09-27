import { Component, HostListener, ElementRef, Renderer, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, RouterState, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from 'ng2-translate';
import { UserLoginService } from './user/user-login/user-login.service';
import { UserRegisterService } from './user/user-register/user-register.service';
import { User } from './user/model/user-model';
import 'rxjs/add/operator/merge';
import { Message } from 'primeng/primeng';
import * as Rx from 'rxjs/Rx'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	public msgs: Message[] = [];
	public currentUser: User;
	private globalClickCallbackFn: Function;
	private loginSuccessCallbackFn: Function;

	constructor(
		// 用于获取native元素, 即dom元素
		public elementRef: ElementRef,
		/*渲染器是 Angular 为我们提供的一种内置服务，用于执行 UI 渲染操作。
		  在浏览器中，渲染是将模型映射到视图的过程。模型的值可以是 JavaScript 中的
		  原始数据类型、对象、数组或其它的数据对象。然而视图可以是页面中的段落、表单、
		  按钮等其他元素，这些页面元素内部使用 DOM (Document Object Model) 来表示。
		  Angular 将会在渲染组件时通过渲染器执行对应相关的操作，比如，创建元素、设置属性、
		  添加样式和订阅事件等。
		  Angular 会利用该组件关联的 renderer 提供的 API，创建该视图中的节点或执行视图的
		  相关操作，比如创建元素 (createElement)、创建文本 (createText)、设置样式 (setStyle) 
		  和 设置事件监听 (listen) 等。
		*/
		public renderer: Renderer,
		public router: Router,
		/*
		snapshot : ActivatedRouteSnapshot 当前路由快照
		url : Observable<urlsegment[]> 当前路由匹配的URL片段。
		params : Observable<Params> 当前路由的矩阵参数
		queryParams : Observable<Params> 所有路由共享的查询参数
		fragment : Observable<string> 所有路由共享的URL片段
		data :Observable<Data> 当前路由的静态或者动态解析的数据。
		outlet: string 当前路由插座的名称。一个常量值。
		component : Type<any>|string 路由对应的组件。一个常量值。
		routeConfig : Route 当前路由状态树的根节点
		root : ActivatedRoute 根路由
		parent : ActivatedRoute 当前路由在状态树中的父节点
		firstChild: ActivatedRoute 当前路由的第一个子节点
		children : ActivatedRoute 当前路由在路由状态树中的所有子节点
		pathFromRoot : ActivatedRoute 根节点到当前节点的路径
		toString() : string
		*/
		public activatedRoute: ActivatedRoute,
		//国际化模块
		public translate: TranslateService,
		public userLoginService: UserLoginService,
		public userRegisterService: UserRegisterService
	) {

	}

	ngOnInit() {
		this.globalClickCallbackFn = this.renderer.listen(this.elementRef.nativeElement, 'click', (event: any) => {
			console.log("全局监听点击事件>" + event);
		});
		this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
		console.log(this.activatedRoute.snapshot);
		console.log(this.router.routerState);
		this.userLoginService.currentUser
			.merge(this.userRegisterService.currentUser)
			.subscribe(
			data => {
				this.currentUser = data;
				//The current snapshot of this route 当前激活的路由快照
				let activatedRouteSnapshot: ActivatedRouteSnapshot = this.activatedRoute.snapshot;
				//当前路由状态
				let routerState: RouterState = this.router.routerState;
				//路由器状态的当前快照
				let routerStateSnapshot: RouterStateSnapshot = routerState.snapshot;

				console.log(activatedRouteSnapshot);
				console.log(routerState);
				console.log(routerStateSnapshot);

				//如果是从/login这个URL进行的登录，跳转到首页，否则什么都不做
				if (routerStateSnapshot.url.indexOf("/login") != -1) {
					//通过url导航
					this.router.navigateByUrl("/home");
				}
			},
			error => console.error(error)
			);

		this.translate.addLangs(["zh", "en"]);
		this.translate.setDefaultLang('zh');

		const browserLang = this.translate.getBrowserLang();
		console.log("检测到的浏览器语言>" + browserLang);
		this.translate.use(browserLang.match(/zh|en/) ? browserLang : 'zh');
	}

	ngOnDestroy() {
		if (this.globalClickCallbackFn) {
			this.globalClickCallbackFn();
		}
	}

	toggle(button: any) {
		console.log(button);
	}

	public doLogout(): void {
		this.userLoginService.logout();
		this.msgs = [];
        this.msgs.push({severity:'success', summary:'Success Message', detail:'退出成功'});
		this.router.navigateByUrl("");
	}

}