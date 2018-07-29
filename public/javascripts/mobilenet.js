var MobileNet = {
  /* 加载 model 的 url */
  MODEL_URL: 'https://storage.googleapis.com/viva-model/clients/tomtop/model.json',
  /* 分辨率为固定值 请勿修改*/
  PREPROCESS_DIVISOR: 127.5,
  /* 预测几率在多少以上当成成功*/
  PICKUP_RATE: 0.7,
  constructor: function (){},
  check_isWifi: function() {
    if (!navigator.connection || navigator.connection.type != "wifi") {
      return false;
    }
    return true;
  },
  check_if_model_exist: function () {
    caches.has(this.MODEL_URL).then(function (result){
      return result;
    });
  },
  /* 加载 model 的 function */
  load: async function (){
    this.model = await tf.loadModel(this.MODEL_URL);
    /* 加载完 model 后进行第一次模拟，可加速用户第一次辨识的速度 */
    this.predict(tf.zeros([1, 224, 224, 3])).dispose();
    /* 加载完后绑定开启相机事件 *可自行加入商务条件 */
    camera_ops.setupCamera('cameraLayer', 'video', 'closeButton', 'middleCanvas', 'cameraButton');
  },
  /* 预测处置，清空模型内预测后的缓存 */
  dispose: function () {
    this.model.dispose();
  },
  /* 预测 function，先将图片正规化后进行预测 */
  predict: function (screenshot) {
    console.time();
    const offset = tf.scalar(this.PREPROCESS_DIVISOR);
    const nomalized = screenshot.sub(offset).div(offset);
    const batched = nomalized.reshape([1,224,224,3]);

    return this.model.predict(batched);
  },
  /* 传入预测结果物件 ,取出预测结果数值进行商务逻辑 */
  getTopResult: async function (logits) {
    /* 取出结果数值*/
    const values = await logits.data();
    /* 将结果传入阵列*/
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    /*进行排序*/
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });

    /* TODO：使用结果阵列引入商务逻辑*/

    console.log(valuesAndIndices);
    console.timeEnd();

  }
}

if(!MobileNet.check_if_model_exist()) {
  if (MobileNet.check_isWifi()){
    MobileNet.load();
  }
} else {
  MobileNet.load();
}
