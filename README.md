# demo-parsehtml
nodejs环境, 网页小说内容自动批量抓取

### 小说网站
http://www.boquge.com/

## local
本地运行

#### 配置文件 config.xml
> 配置bookid：书籍编号
>
> 配置start-chapter：指定开始导出章节
>
> 配置output-dir：指定导出目录

#### 安装依赖
> 1. `cd local`
>
> 2. `npm install`

#### 运行
> 方法1：`node demo.js`
>
> 方法2：`./exec.sh` (mac)
>
> 方法3：双击exec.bat (windows)

## server
服务器运行，图形用户界面

#### 安装依赖
> 1. `cd server`
>
> 2. `npm install`

#### 运行
> `npm start`
>
> 打开浏览器，输入 http://127.0.0.1:3000/
