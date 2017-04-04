'use strict';

$(document).ready(function() {
    nameFunc();
    if (window.location.pathname == '/') listView();
    if (window.location.pathname == '/my') openUser(null);
    $(".list").on("click", "img.imgWho", function() {
        openUser(this.id);
    });
    $(".list").on("click", "p.like", function() {
        like(this.id);
    });
    $(".list").on("click", "div.remove", function() {
        remove(this.id.substr(1));
    });
});

// View user name
function nameFunc() {
    $.ajax({
        type: 'POST',
        url: '/nameD',						
        success: function(data) {
            $('#display-name').html(data);
        }
    });
}

// View list items
function listView() {
    $.ajax({
        type: 'POST',
        url: '/view',
        success: function(data) {
            var str = '',
                style = '',
                arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
            for (var i = 0; i < arr.length - 1; i = i + 7) {
                if (arr[i + 6] == 'OK') style = 'color: rgba(0, 182, 212, 0.7); border-color: rgba(0, 182, 212, 0.5);';
                else style = '';
                str += '<div class="list-item"><img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><p class="text1">' + arr[i + 2] + '</p><div class="imgCont"><p id="' + arr[i] + '" class="like" style="' + style + '">Like ' + arr[i + 3] + '</p><img class="imgWho" id="' + arr[i + 4] + '" src="' + arr[i + 5] + '"></div></div>';
            }
            $('.list').css({'-webkit-column-count':'5', '-moz-column-count':'5', 'column-count':'5'});
            $('.list').html(str);
        }
    });
}

// Delete image
function remove(arg) {
    $('#D' + arg).parent().css({'opacity':'.3'});
    var data = {id : arg};
    $.ajax({
        type: 'POST',
        url: '/remove',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            $('#D' + arg).parent().remove();
        }
    });
}

// Open user list
function openUser(arg) {
    $('.list').css({'-webkit-column-count':'1', '-moz-column-count':'1', 'column-count':'1'});
    $('.list').html('Loading...');
    var data = {who : arg};
    $.ajax({
        type: 'POST',
        url: '/userList',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (window.location.pathname != '/my') $('.menu').css({'color':'#727272'});
            var str = '',
                style = '',
                remove = '',
                arr = data.split('9B_mn2WZfTIYyUZeSvkZ_5IXBKU');
            for (var i = 0; i < arr.length - 1; i = i + 7) {
                if (arr[i + 6] == 'OK') style = 'color: rgba(0, 182, 212, 0.7); border-color: rgba(0, 182, 212, 0.5);';
                else style = '';
                if (window.location.pathname == '/my') remove = '<div id="D' + arr[i] + '" class="remove">X</div>';
                str += '<div class="list-item">' + remove + '<img class="img" src="' + arr[i + 1] + '" onError="this.src=`/public/img/logo.png`"><p class="text1">' + arr[i + 2] + '</p><div class="imgCont"><p id="' + arr[i] + '" class="like" style="' + style + '">Like ' + arr[i + 3] + '</p><img class="imgWho" id="' + arr[i + 4] + '" src="' + arr[i + 5] + '"></div></div>';
            }
            $('#display-name').text(arr[arr.length - 1]);
            if (window.location.pathname != '/my') $('#display-name').css({'color':'#ffa000'});
            $('.list').css({'-webkit-column-count':'5', '-moz-column-count':'5', 'column-count':'5'});
            $('.list').html(str);
        }
    });
}

// Put like
function like(arg) {
    var data = {id : arg},
        doc = $('#' + arg).html();
    $('#' + arg).html('Wait...');
    $.ajax({
        type: 'POST',
        url: '/like',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (data == 'error') {
                alert('First, login!');
                $('#' + arg).html(doc);
            }
            else {
                var arr = data.split('@');
                if (arr[1] == 'OK') $('#' + arg).css({'color':'rgba(0, 182, 212, 0.7)', 'border-color':'rgba(0, 182, 212, 0.5)'});
                else $('#' + arg).css({'color':'rgba(102, 102, 102, 0.7)', 'border-color':'rgba(102, 102, 102, 0.2)'});
                $('#' + arg).html(arr[0]);
            }
        }
    });
}

// Add new image
function newImage() {
    $('#text').val($('#text').val().replace(/\s{2,}/g, ' '));
    if ($('#url').val() == '' || $('#text').val() == '') {
        alert('Fill in all the fields!');
        return false;
    }
    var test = new Image();
    test.onload = imageFound;
    test.onerror = imageNotFound;
    test.src = $('#url').val();
}

function imageFound() {
    var data = {
        url : $('#url').val(),
        text : $('#text').val()
    };
    $('#add').val('Wait...');
    $.ajax({
        type: 'POST',
        url: '/new',
        data: JSON.stringify(data),
		contentType: 'application/json',
        success: function(data) {
            if (data == 'error') alert('Error! The image was not added!');
            else {
                $('#url').val('');
                $('#text').val('');
                alert('Image successfully added.');
            }
            $('#add').val('Make');
        }
    });
}

function imageNotFound() {
    alert('Image is corrupted!');
}