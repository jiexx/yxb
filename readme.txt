http://www.wxyxb.com/keeper
/server.wxyxb.com/keeper/spread
1.build uid, save advertising txt in /server.wxyxb.com/keeper/ad/UID
2.build QR*(http://www.wxyxb.com/keeper/signs/UID)
3.save http://www.wxyxb.com/UID(include QR*)

refer: https://cnodejs.org/topic/515d48b96d38277306454d6a

http://www.wxyxb.com/UID -> http://www.wxyxb.com/keeper/signs/UID
socket on status
UPDATE, update QR img
DOING -> show doing
DONE , show thanks.

/server.wxyxb.com/UID/client/new 
1.if record not exit, new one record in clients table, clientid|child_process|status
2.if child_process exit, then kill it, and new child_process.spawn to run casperjs, status = 'INIT', open QR# on wx.qq.com
3.save QR# on /server.wxyxb.com/keeper/qr/UID.jpg, status = 'UPDATE', socket emit status, wait client login...
login
4.sprend /server.wxyxb.com/keeper/ad/UID, status = 'DOING', socket emit status
5.exit, status = 'DONE', socket emit status, kill child_process, update child_process|status in clients table.





