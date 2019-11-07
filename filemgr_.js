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
            position: 'right-bottom'
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
Array.prototype.equals = function (array) {
    if (!array) return false;
    if (this.length != array.length) return false;
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) {
            return false;   
        }           
    }
    return true;
}
Object.defineProperty(Array.prototype, "equals", {enumerable: false});
var taboldselflink = [];
function filelistclick() {
    setTimeout(function(){
        const rowselected = document.getElementById("filelisttable").getElementsByClassName("mdui-table-row-selected");
        const selectedi = rowselected.length;
        var tabselflink = [];
        var allfilesize = 0;
        var allfile = 0;
        var alldir = 0;
        for (let i = 0; i < selectedi; i++) {
            const row = rowselected[i];
            const alink = row.getElementsByClassName("alink")[0].innerText;
            // const filename = row.getElementsByClassName("filename")[0].innerText;
            const type = row.getElementsByClassName("type")[0].innerText;
            const size = parseInt(row.getElementsByClassName("size")[0].innerText);
            // const mtime = row.getElementsByClassName("mtime")[0].innerText;
            // const atime = row.getElementsByClassName("atime")[0].innerText;
            // const fauth = row.getElementsByClassName("fauth")[0].innerText;
            tabselflink.push(alink);
            allfilesize += size;
            if (type == "文件夹") alldir++;
            else allfile++;
        }
        if (!tabselflink.equals(taboldselflink)) {
            taboldselflink = tabselflink;
            var message = "已选择 ";
            if (allfile > 0 || alldir > 0) {
                if (allfile > 0) {
                    message += allfile+" 个文件( "+sizeunit(allfilesize)+" )";
                }
                if (alldir > 0) {
                    if (allfile > 0) message += ", ";
                    message += alldir+" 个文件夹";
                }
            } else {
                message = "取消选择";
            }
            mdui.snackbar({
                message: message,
                position: 'right-bottom'
            });
        }
    },100);
}
function deletefiles(candelete) {
    var rowselected = document.getElementById("filelisttable").getElementsByClassName("mdui-table-row-selected");
    const selectedi = rowselected.length;
    if (selectedi == 0) {
        mdui.snackbar({
            message: '请先选择要删除的文件',
            position: 'right-bottom'
        });
        return;
    }
    var filelist = [];
    var fileliststr = '<div class="mdui-typo"><ul>';
    for (let i = 0; i < selectedi; i++) {
        const row = rowselected[i];
        filename = row.getElementsByClassName("filename")[0].innerText;
        filelist.push(filename);
        fileliststr += '<li>'+filename+'</li>';
    }
    fileliststr += '</ul></div>';
    mdui.dialog({
        title: '将会永久删除以下文件，确认码？',
        content: fileliststr,
        buttons: [
        {
        text: '取消操作'
        },
        {
        text: '永久删除！',
            onClick: function(inst){
                if (candelete) {
                    deletefilesnow(filelist);
                } else {
                    mdui.alert("此文件具有保护，禁止删除。", '删除失败');
                }
            }
        }
    ]
    });
}
function deletefilesnow(filelist) {
    mdui.snackbar({
        message: '正在删除...',
        position: 'right-bottom'
    });
    var form = new FormData();
    form.append("filelist",filelist);
    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("post",window.location.href,true);
    xhr.onload = function(evt) {
        // var response = evt.currentTarget.responseText;
        // if (response == "") response = "失败";
        // mdui.alert(response, '删除结果');
        window.location.reload(true);
    }
    xhr.onerror = function(evt) {
        var response = evt.currentTarget.responseText;
        mdui.alert(response, '删除失败');
    }
    xhr.send(form);
}