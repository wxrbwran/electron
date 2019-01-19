const { app, BrowserWindow, ipcMain } = require('electron');
const MenuBuilder = require('./menu');

let win;

function createWindow() {
  win = new BrowserWindow();
  win.loadFile('./index.html');
  win.webContents.openDevTools();
  win.on('closed', () => { win = null });

  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();

  win.webContents.on('did-finish-load', () => {
    // 发送数据给渲染程序
    win.webContents.send('main2render', '主进程发送到渲染进程的数据')
  })
}



app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  setTimeout(() => {
    event.sender.send('asynchronous-reply', {
      status: 'success',
      data: 'async_pong'
    })
  }, 3000);
})

