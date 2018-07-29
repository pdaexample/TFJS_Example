var general_ops = {
  isAndroid: function () {
    return /Android/i.test(navigator.userAgent);
  },
  isiOS: function () {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },
  isMobile: function () {
    return this.isAndroid() || this.isiOS();
  },
  showMessage: function (message) {
    alert(message);
  }
};

var camera_ops = {
  IDENTIFY_WAIT_TIME: 1500,
  cameraLayer: undefined,
  video: undefined,
  closeButton: undefined,
  middleCanvas: undefined,
  main_content: undefined,
  videoStream: undefined,
  loadingLayer: undefined,
  /* 绑定相机事件*/
  setupCamera: function(cameraLayerId, videoId, closeButtonId, middleCanvasId, cameraTriggerId) {
    this.cameraLayer = document.getElementById(cameraLayerId);
    this.video = document.getElementById(videoId);
    this.closeButton = document.getElementById(closeButtonId);
    this.middleCanvas = document.getElementById(middleCanvasId);
    this.loadingLayer = document.getElementById('loadingLayer')
    this.main_content = document.getElementsByClassName('mdl-layout__container');
    //setup camera trigger
    this.addCameraEvent(cameraTriggerId);
    this.bindCameraLayerClose();
  },
  checkAvailable: function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }
    return true;
  },
  addCameraEvent: function (id) {
    const w = screen.width;
    const h = screen.width;
    console.log('width:' + w + ", h:" + h);
    const cameraButton = document.getElementById(id);

    cameraButton.addEventListener('click', async function () {
      if (!general_ops.isMobile()) {
        general_ops.showMessage('Only support mobile device for now!');
        return;
      }
      if (!camera_ops.checkAvailable()) {
        general_ops.showMessage('You browser not support browser camera api');
        return;
      }
      camera_ops.video.width = w;
      camera_ops.video.height = h;
      camera_ops.videoStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video :{
          facingMode: 'environment',
          width: { min: 224, ideal: 448, max: 1344 },
          height: { min: 224, ideal: 448, max: 1344 }
        }
      });
      camera_ops.video.srcObject = camera_ops.videoStream;

      return (new Promise((resolve) => {
          camera_ops.video.onloadedmetadata = () => {
            camera_ops.main_content[0].style = 'display: none';
            camera_ops.cameraLayer.style.display = 'block';
            camera_ops.video.play();
            camera_ops.video.style.display = 'block';
            camera_ops.closeButton.style.display = 'block';
            console.time();
            resolve('init');

          };
        })).then(function() {
          setTimeout(function () {
            camera_ops.loadingLayer.classList.add('show');
            this.video.pause();
            camera_ops.snapshot(); },
            camera_ops.IDENTIFY_WAIT_TIME);

        });
    })

    cameraButton.classList.add('fadeIn');
  },
  bindCameraLayerClose: function () {
    this.closeButton.addEventListener('click', function () {
      camera_ops.main_content[0].style.display = 'block';
      camera_ops.cameraLayer.style.display = 'none';
      camera_ops.video.pause();
      camera_ops.videoStream.getTracks()[0].stop();
      camera_ops.video.style.display = 'none';
      camera_ops.closeButton.style.display = 'none';
      camera_ops.loadingLayer.className = '';
    });
  },

  snapshot: function () {
    console.timeEnd();
    const imageToPredict = document.getElementById('imageToPredict');
    this.middleCanvas.width = camera_ops.video.width;
    this.middleCanvas.height = camera_ops.video.height;
    let canvasContext = this.middleCanvas.getContext('2d');
    canvasContext.drawImage(camera_ops.video, 0, 0, camera_ops.video.width, camera_ops.video.height);
    imageToPredict.src = this.middleCanvas.toDataURL('image/jpeg');
    imageToPredict.width = '224';
    imageToPredict.height = '224';
    imageToPredict.onload = function () {predict_ops.runPredict(imageToPredict);}
  }
};

var predict_ops = {
  runPredict: function (input) {
    const pixels = tf.fromPixels(input).toFloat();
    let result = MobileNet.predict(pixels);
    MobileNet.getTopResult(result);
  }
}
