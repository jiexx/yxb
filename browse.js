var Recurse = require('./step.js');
var Steps = require('./step.js');
var LOG = require('./log.js');
var csper = require('casper');
var browser = require('./browsercfg.js')(csper);
var _prev = null, _curr = null;

if (browser.cli.args.length != 2) {
	LOG.i('Usage: browse.js <uid> <AD.>');
	browser.exit();
}else {

browser.start();

browser.thenOpen('https://wx.qq.com');
LOG.i('Open');

///////////////////////////////////////////////////////////////////////////////////////////////////////
var _prev = null, _curr = null;
function check1() {
	LOG.i('if web_wechat_tab_friends active ?');
	return browser.evaluate(function () {
		return document.querySelectorAll('i.web_wechat_tab_friends.web_wechat_tab_friends_hl').length > 0 && document.querySelectorAll('#navContact div').length > 5;
	});
}
function then1(next) {
	LOG.i('if web_wechat_tab_friends then key down');
	_prev = browser.evaluate(function () {
		var e = {};
		if(document.querySelector('#navContact div div div.active div div.info h4.nickname')) {
			console.log('====active  _prev '+document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML);
			e.name = document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML;
			e.avatar = document.querySelector('#navContact div div div.active div div.avatar img').src;
		}
		
		var event = document.createEvent("Events");
		event.initEvent("keydown", true, true);
		event.keyCode = 40;
		document.querySelector('#navContact').dispatchEvent(event);
		
		return e;
	});
	next();
}
function check2() {
	LOG.i('if _prev =  _curr ?');
	_curr = browser.evaluate(function () {
		var e = {};
		if(document.querySelector('#navContact div div div.active div div.info h4.nickname')) {
			console.log('====active  _curr '+document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML);
			e.name = document.querySelector('#navContact div div div.active div div.info h4.nickname').innerHTML;
			e.avatar = document.querySelector('#navContact div div div.active div div.avatar img').src;
		}
		return e;
	});
	if(_prev && _curr && _prev.avatar == _curr.avatar) {
		return false;
	}else {
		return true;
	}
}
function then2(next) {
	LOG.i('if _prev <> _curr then chat button down');
	browser.click('div.action_area a.button');
	next();
}
function check3() {
	LOG.i('if web_wechat_tab_chat active ?');
	return browser.evaluate(function () {
		return document.querySelectorAll('i.web_wechat_tab_chat.web_wechat_tab_chat_hl').length > 0;
	});
}
function then3(next) {
	LOG.i('if web_wechat_tab_chat then send chat ');
	browser.sendKeys('pre#editArea', browser.cli.args[1], {keepFocus: true});
	browser.sendKeys('pre#editArea', browser.page.event.key.Escape );
	browser.click('a.btn.btn_send');
	next();
}
function check4() {
	LOG.i('if js_message_plain sent ?');
	return browser.evaluate(function () {
		return document.querySelectorAll('pre.js_message_plain').length > 0;
	});
}
function then4(next) {
	LOG.i('if js_message_plain sent then next ');
	next();
}


function stepsLoop(recurNext) {
	var steps = new Steps(
		[{check:check1,then:then1},
		{check:check2,then:then2},
		{check:check3,then:then3},
		{check:check4,then:then4},
		], 1024, function(){
			LOG.i('>>>>>>>one sent! ');
			recurNext();
		}
	);
	steps.waitloop(browser);
}


function checkNavContact() {
	LOG.i('if navContact active & not end ?');
	return browser.evaluate(function () {
		var e = document.querySelector('#navContact div div div.active');
		var r = (e && e.parentNode && e.parentNode.nextSibling && e.parentNode.nextSibling.isSameNode(document.querySelector('#navContact div div.bottom-placeholder')) ? true : false);
		return r;
	});
}
function thenClickNavContact(next) {
	LOG.i('if navContact active & not end then click ');
	browser.sendKeys('pre#editArea', browser.page.event.key.Escape );
	browser.click('a[ui-sref=contact]');
	stepsLoop(next);
}
function onRecurseFinish() {
	LOG.json({cmd:'DONE'});
	browser.click('body div.main div div.panel div.header div.info h3 a');
	browser.waitFor(function check() {
		return this.evaluate(function () {
			return document.querySelectorAll('#mmpop_system_menu').length > 0;
		});
	}, function(){
		browser.click('#mmpop_system_menu ul li.last_child a');
		LOG.json({cmd:'DONE'});
		browser.exit();
	});
}

var recurse = new Recurse(
	{check:checkNavContact, then:thenClickNavContact},
	3, onRecurseFinish
);


browser.waitFor(function check() {
	return this.evaluate(function () {
		console.log(document.querySelector('div.qrcode img').src);
		return document.querySelectorAll('div.qrcode').length > 0;
	});
}, function () {
	//console.log(browser.getElementAttribute('div.qrcode img', 'src'));
	LOG.i( 'UPDATE' );
	browser.download(browser.getElementAttribute('div.qrcode img', 'src'), 'qrcode/' + browser.cli.args[0] + '.jpg');
	LOG.json({cmd:'UPDATE', path:'qr/' + browser.cli.args[0] + '.jpg'});
	
	browser.waitFor(function check() {
		return this.evaluate(function () {
			return document.querySelectorAll('#navContact div div div.ng-isolate-scope').length > 0;
		});
	}, function () {
		LOG.json({cmd:'DOING'});
		
		recurse.untilloop();
	});
});

browser.run();
}