<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
.amap-info-window__low {
  min-width: 180rpx;
  padding: 8rpx 20rpx;
  border: 1rpx solid #fbb60d;
  border-radius: 10rpx;
  background: #fff;
  box-shadow: 0px 8px 17rpx 0px rgba(189, 193, 215, 0.5);
  position: relative;
  text-align: center;
  &::before {
    content: "";
    display: block;
    border-top: 11rpx solid #fbb60d;
    border-left: 11rpx solid transparent;
    border-right: 11rpx solid transparent;
    border-bottom: 11rpx solid transparent;
    position: absolute;
    top: calc(100% + 11rpx);
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &::after {
    content: "";
    display: block;
    border-top: 10rpx solid #fff;
    border-left: 10rpx solid transparent;
    border-right: 10rpx solid transparent;
    border-bottom: 10rpx solid transparent;
    position: absolute;
    top: calc(100% + 10rpx);
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .amap-info-title {
    font-size: 22rpx;
    font-weight: 800;
    color: #303033;
    line-height: 30rpx;
  }
  .amap-info-price {
    margin-top: 4rpx;
    font-size: 22rpx;
    font-weight: 800;
    color: #6d6d73;
    line-height: 30rpx;
  }
}
.amap-info-window__normal {
  @extend .amap-info-window__low;
  border: 1rpx solid #fb6b52;
  &::before {
    border-top: 11rpx solid #fb6b52;
  }
}
.amap-info-window__high {
  @extend .amap-info-window__low;
  border: 1rpx solid #ff4444;
  &::before {
    border-top: 11rpx solid #ff4444;
  }
}
.amap-info-window__selected {
  @extend .amap-info-window__low;
  border: 1rpx solid #ff4444;
  background: #ff4444;
  &::before {
    border-top: 11rpx solid #ff4444;
  }
  &::after {
    border-top: 11rpx solid #ff4444;
  }
  .amap-info-title {
    color: #ffffff;
  }
  .amap-info-price {
    color: #ffffff;
  }
}
</style>
