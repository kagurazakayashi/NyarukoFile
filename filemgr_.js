var uploadDialog = null;
var files = [];
var fileupi = 0;
function openUploadDiglog() {
    uploadDialog = new mdui.Dialog("#uploadDialog", {
        history: false,
        modal: true,
        closeOnEsc: false
    });
    uploadDialog.open();
}
function fileSelected() {
    files = document.getElementById('fileToUpload').files;
    var listtable = "";
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        listtable += "<tr id='uploaditem"+i+"'><td id='uploaditemp"+i+"'>待上传</td><td>"+file.name+"</td><td>"+sizeunit(file.size)+"</td><td>"+file.type+"</td></tr>";
    }
    if (files.length > 0) {
        document.getElementById("btn_btn_startupd").style.display = "inline-block";
        document.getElementById("btn_cancelupd").innerText = "取消";
    }
    document.getElementById("uploadlist").innerHTML = listtable;
    uploadDialog.handleUpdate();
}
function sizeunit(bytes)
{
    if (bytes >= 1073741824) bytes = (bytes / 1073741824).toFixed(2) + ' GB';
    else if (bytes >= 1048576) bytes = (bytes / 1048576).toFixed(2) + ' MB';
    else if (bytes >= 1024) bytes = (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes > 1) bytes = bytes + ' B';
    else if (bytes == 1) bytes = bytes + ' B';
    else bytes = '0 B';
    return bytes;
}
function cancelUpload() {
    uploadDialog.close();
    if (document.getElementById("btn_cancelupd").innerText != "后台") window.location.reload(true);
}
function uploadfile() {
    if (files.length == 0) {
        mdui.snackbar({
            message: '请先选择要上传的文件',
            position: 'left-bottom'
        });
        return;
    }
    document.getElementById("btn_btn_startupd").style.display = "none";
    document.getElementById("btn_cancelupd").innerText = "后台";
    const file = files[fileupi];
    var form = new FormData();
    form.append("file", file);
    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("post",window.location.href,true);
    xhr.onload = function(evt) {
        var response = evt.currentTarget.responseText;
        if (response == "") response = "失败";
        document.getElementById("uploaditemp"+fileupi).innerText = response;
        uploadfileend();
    }
    xhr.onerror = function(evt) {
        var response = evt.currentTarget.responseText;
        if (response == "") response = "失败";
        document.getElementById("uploaditemp"+fileupi).innerText = response;
        uploadfileend();
    }
    xhr.upload.onloadstart = function(evt) {
        //开始上传
    }
    xhr.upload.onprogress =function(evt){
        //上传进度
        const loaded = evt.loaded;
        const total = evt.total;
        const percentage = loaded / total * 100;
        if (loaded >= total) {
            document.getElementById("uploaditemp"+fileupi).innerText = "100%";
        } else {
            document.getElementById("uploaditemp"+fileupi).innerText = percentage.toFixed(2) + " %";
        }
    };
    xhr.send(form);
}
function uploadfileend() {
    uploadDialog.handleUpdate();
    fileupi++;
    if (fileupi >= files.length) {
        fileupi = 0;
        files = [];
        document.getElementById("btn_cancelupd").innerText = "完成";
    } else {
        uploadfile();
    }
}