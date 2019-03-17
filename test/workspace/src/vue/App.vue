<template>
  <div id="app" :class="$style.apLl">
    <div id="nav" :class="$style.apLk">
      asdf
    </div>
    {{ $style.ab }}
    <div v-bind:class="{ [$style.apLl] : true }">asdf</div>
  </div>
</template>

<script lang="ts">
import * as css from './out.modules.less';
export default  {
  data: {
    k: css.ab,
    c: this.$style.apLk,
  }
}
</script>

<style lang="less" module>
@import './out.modules.less';
@import '~test/index';
.ap-lk {
  color: red;
}

.ap-lk {
  color: red;
}
</style>

<style lang="less" module>
@import './out.modules.less';
.ap-ll {
  color: red;
}
</style>
