<?php
$root = "/"; //相对目录的根文件夹，以"/"结尾，默认为这个 PHP 文件在哪就浏览哪个文件夹。
$rootdir = dirname(__FILE__); //设置文件夹访问权限范围，防止恶意浏览，默认值为当前PHP文件目录为最高限制目录。

$ddir = "";
$ddira = "?";
ini_set('open_basedir', ($rootdir.';'.sys_get_temp_dir()));
if (isset($_GET['path']) && strlen($_GET['path']) > 0) {
    $root .= $_GET['path'];
    $root = str_replace("\\","/",$root);
    while (1) {
        $root = str_replace("//","/",$root,$rcount);
        if ($rcount == 0) break;
    }
    $patharr = explode('/',$_GET['path']);
    if (count($patharr) > 1) {
        array_pop($patharr);
        array_pop($patharr);
        $ddir = implode('/',$patharr);
        if ($ddir != "") {
            $ddira = "?path=".$ddir."/";
        }
    }
}
$dirname = @dirname(__FILE__);
$path = str_replace("\\","/",$dirname.$root);
$dir = @opendir($path);
$canopen = ($dir) ? true : false;
if ($canopen && isset($_FILES) && count($_FILES) > 0) {
    foreach ($_FILES as $tfile) {
        $disableExts = array("php");
        $temp = explode(".", $tfile["name"]);
        $extension = end($temp);
        if ($tfile["type"] == "text/x-php" || in_array($extension, $disableExts)) {
            echo "不支持的文件类型";
        } else if ($tfile["error"] > 0) {
            echo "错误：" . $tfile["error"];
        } else {
            // if (file_exists($dir . $tfile["name"])) {
            //     echo "文件已存在";
            // } else {
                move_uploaded_file($tfile["tmp_name"], $path .'/'. $tfile["name"]);
                echo "完成";
            // }
        }
    }
    die();
}

function sizeunit($bytes)
{
    if ($bytes >= 1073741824) $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    elseif ($bytes >= 1048576) $bytes = number_format($bytes / 1048576, 2) . ' MB';
    elseif ($bytes >= 1024) $bytes = number_format($bytes / 1024, 2) . ' KB';
    elseif ($bytes > 1) $bytes = $bytes . ' B';
    elseif ($bytes == 1) $bytes = $bytes . ' B';
    else $bytes = '0 B';
    return $bytes;
}
$filetable = "";
$allsize = 0;
$allfile = 0;
$alldir = 0;
$rootdirlen = strlen($rootdir);
if ($canopen) {
    while($content = readdir($dir)){
        if($content != '.' && $content != '..'){
            $fullpath = $path.$content;
            $dirname = dirname($fullpath);
            // if (strlen($dirname) < $rootdirlen || strcmp(substr($dirname,0,$rootdirlen),$rootdir) != 0) die("ERR");
            $type = mime_content_type($fullpath);
            $typearr = explode("/",$type);
            $alink = str_replace("\\","/",$root.(str_replace("/","%2F",$content)));
            $icon = "24d";
            if ($type == "directory") {
                $type = "文件夹";
                $alldir++;
                $icon = "2c7";
                $alink = "?path=".$alink."/";
            } else {
                $allfile++;
            }
            $alinkarr = explode("/",$alink);
            for ($i=1; $i < count($alinkarr); $i++) {
                $alinkarr[$i] = rawurlencode($alinkarr[$i]);
            }
            $alink = implode("/",$alinkarr);
            if ($alink[0] == '/') $alink = substr($alink, 1);
            $typeicon = ["inode"=>"14f","text"=>"873","image"=>"3f4","video"=>"63a","application"=>"8b8","audio"=>"405","font"=>"8e2","message"=>"0c9","drawing"=>"40a","x-world"=>"14c"];
            if (isset($typeicon[$typearr[0]])) $icon = $typeicon[$typearr[0]];
            $filetable .= "<tr>";
            $filetable .= "<td><a href='".$alink."' mdui-tooltip=\"{content: '".$content."'}\"><div class='mdui-chip'><span class='mdui-chip-icon'><i class='mdui-icon material-icons'>&#xe".$icon.";</i></span><span class='mdui-chip-title'>".$content."</span></div></a></td>";
            $filetable .= "<td>".$type."</td>";
            $fsize = filesize($fullpath);
            $allsize += $fsize;
            if ($icon == "2c7") {
                $filetable .= "<td></td>";
            } else {
                $filetable .= "<td><span mdui-tooltip=\"{content: '".$fsize." 字节'}\">".sizeunit($fsize)."</span></td>";
            }
            $mtime = filemtime($fullpath);
            $filetable .= "<td>"."<span mdui-tooltip=\"{content: '时间戳：".$mtime."'}\">".date("Y-m-d h:i:s",$mtime)."</span></td>";
            $atime = fileatime($fullpath);
            $filetable .= "<td>"."<span mdui-tooltip=\"{content: '时间戳：".$atime."'}\">".date("Y-m-d h:i:s",$atime)."</span></td>";
            $filetable .= "<td>";
            if (is_executable($fullpath)) $filetable .= "<span mdui-tooltip=\"{content: '可执行文件'}\">X</span>";
            if (is_link($fullpath)) $filetable .= "<span mdui-tooltip=\"{content: '链接文件'}\">L</span>";
            if (is_readable($fullpath)) $filetable .= "<span mdui-tooltip=\"{content: '拥有读取权限'}\">R</span>";
            if (is_writable($fullpath)) $filetable .= "<span mdui-tooltip=\"{content: '拥有写入权限'}\">W</span>";
            $filetable .= "</td>";
            $filetable .= "</tr>";
        }
    }
    closedir($dir);
}
$allsize = $allfile." 文件, ".$alldir." 文件夹, <span mdui-tooltip=\"{content: '".$allsize." 字节'}\">".sizeunit($allsize)."</span>";
?>
<!DOCTYPE html>
<html lang="zh-cmn-Hans">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
    <meta name="renderer" content="webkit">
    <meta http-equiv="Cache-Control" content="no-siteapp"/>
    <title>文件列表</title>
    <link rel="stylesheet" href="/node_modules/mdui/dist/css/mdui.min.css">
    <link rel="stylesheet" href="filemgr_.css">
</head>
<body class="mdui-loaded mdui-theme-primary-green mdui-theme-accent-pink">
<div class="mdui-appbar">
    <div class="mdui-toolbar mdui-color-theme">
        <a href="<?php echo $ddira; ?>" class="mdui-btn mdui-btn-icon" title="上级文件夹"><i class="mdui-icon material-icons">&#xe8fb;</i></a>
        <a href="javascript:;" class="mdui-typo-headline"><?php echo $root; ?></a>
        <a href="javascript:;" class="mdui-typo-title"><?php echo $allsize; ?></a>
        <div class="mdui-toolbar-spacer"></div>
        <div class="mdui-textfield mdui-textfield-expandable mdui-float-right">
            <button class="mdui-textfield-icon mdui-btn mdui-btn-icon" title="搜索"><i class="mdui-icon material-icons">&#xe8b6;</i></button>
            <input class="mdui-textfield-input" type="text" placeholder="Search"/>
            <button class="mdui-textfield-close mdui-btn mdui-btn-icon" title="取消搜索"><i class="mdui-icon material-icons">&#xe5cd;</i></button>
        </div>
        <a href="javascript:window.location.reload(true);" class="mdui-btn mdui-btn-icon" title="刷新"><i class="mdui-icon material-icons">&#xe5d5;</i></a>
        <a href="javascript:openUploadDiglog();" class="mdui-btn mdui-btn-icon" title="上传文件"><i class="mdui-icon material-icons">&#xe2c3;</i></a>
    </div>
</div>
<div class="mdui-table-fluid">
    <table class="mdui-table mdui-table-selectable mdui-table-hoverable">
        <thead>
            <tr>
                <th>名称</th>
                <th>类型</th>
                <th>大小</th>
                <th>修改时间</th>
                <th>访问时间</th>
                <th>属性权限</th>
            </tr>
        </thead>
        <tbody>
        <?php echo $filetable; ?>
        </tbody>
    </table>
</div>
<?php if ($allfile == 0 && $alldir == 0) {
    if ($canopen) {
        echo '<button class="mdui-btn" disabled>此文件夹中没有文件。</button>';
    } else {
        header('HTTP/1.1 403 文件不存在或访问被拒绝');
        echo '<button class="mdui-btn" disabled>文件不存在或访问被拒绝。</button>';
    }
} ?>
<div class="mdui-dialog" id="uploadDialog">
    <div class="mdui-dialog-title"><i class="mdui-icon material-icons">&#xe2c3;</i> 文件上载</div>
    <div class="mdui-dialog-content">
        <p><input class="mdui-btn" id="fileToUpload" name="userfile" type="file" onchange="fileSelected();" style="width:100%" multiple /></p>
        <div class="mdui-table-fluid">
            <table class="mdui-table mdui-table-hoverable">
                <thead>
                    <tr>
                        <th>进度</th>
                        <th>名称</th>
                        <th>大小</th>
                        <th>类型</th>
                    </tr>
                </thead>
                <tbody id="uploadlist"></tbody>
            </table>
        </div>
    </div>
    <div class="mdui-dialog-actions">
        <button class="mdui-btn mdui-ripple" onclick="uploadfile()" id="btn_btn_startupd" style="display:none">开始上传</button>
        <button class="mdui-btn mdui-ripple" onclick="cancelUpload()" id="btn_cancelupd">取消</button>
    </div>
</div>
<script src="/node_modules/mdui/dist/js/mdui.min.js"></script>
<script>var $$ = mdui.JQ;</script>
<script src="filemgr_.js"></script>
</body>
</html>