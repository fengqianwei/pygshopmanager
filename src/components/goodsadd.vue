<template>
  <el-card class="box">
    <cus-bread level1="商品管理" level2="商品列表"></cus-bread>
    <!-- 提示框 -->
    <el-alert class="alert" title="添加商品信息" type="info" center show-icon></el-alert>
    <!-- 步骤条 -->
    <el-steps :active="active*1" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>
    <!-- 标签页 -->
    <el-form :model="form" class="form" label-position="top" label-width="80px">
      <el-tabs @tab-click="changeTab()" v-model="active" tab-position="left">
        <el-tab-pane name="1" label="基本信息">
          <el-form-item label="商品名称">
            <el-input v-model="form.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 表单元素 --级联选择器-->
            {{selectedOptions}}
            <el-cascader
              expand-trigger="hover"
              :options="options"
              clearable
              :props="defaultProp"
              v-model="selectedOptions"
              @change="handleChange"
            ></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="2" label="商品参数">
          <!-- 复选框 -->
          <el-form-item :label="item1.attr_name" v-for="(item1) in arrDy" :key="item1.attr_id">
            <el-checkbox-group v-model="item1.attr_vals">
              <el-checkbox border :label="item2" v-for="(item2, i) in item1.attr_vals" :key="i"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="3" label="商品属性">
          <el-form-item :label="item.attr_name" v-for="(item, i) in arrStatic" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="4" label="商品图片">
          <el-form-item>
            <el-upload
              action="http://localhost:8888/api/private/v1/upload"
              :headers="headers"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane name="5" label="商品内容">
          <el-form-item>
            <el-button @click="addGoods()">添加商品</el-button>
            <quill-editor class="quill" v-model="form.goods_introduce"></quill-editor>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>

<script>
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

import { quillEditor } from "vue-quill-editor";
export default {
  data() {
    return {
      active: "1",
      //添加商品的表单数据
      form: {
        goods_name: "",
        goods_cat: "",
        goods_price: "",
        goods_number: "",
        goods_weight: "",
        goods_introduce: "",
        pics: [],
        attrs: []
      },
      //级联选择器数据
      options: [],
      selectedOptions: [1, 3, 6],
      defaultProp: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      //动态参数数组
      arrDy: [],
      //静态参数数组
      arrStatic: [],
      //设置权限
      headers: {
        Authorization: localStorage.getItem("token")
      }
    };
  },
  components: {
    quillEditor
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    //添加商品
    async addGoods() {
      //处理goods_cat
      this.form.goods_cat = this.selectedOptions.join(",");
      //动态
      const arr1 = this.arrDy.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_value };
      });
      //静态
      const arr2 = this.arrStatic.map(item => {
        return { attr_id: item.attr_id, attr_value: item.attr_value };
      });
      this.form.attrs = [...arr1, ...arr2];
      const res = await this.$http.post(`goods`, this.form);
      console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 201) {
        //提示
        this.$message.success(msg);
        //回到列表
        this.$router.push({
          name: "goods"
        });
      } else {
        this.$message.error(msg);
      }
    },
    //上传图片
    handleRemove(file, fileList) {
      console.log(file);
      // file.response.data.tmp_path
      const Index = this.form.pics.findIndex(item => {
        return item.pic === file.response.data.tmp_path;
      });
      this.form.pics.slice(Index, 1);
    },
    handleSuccess(response, file, fileList) {
      console.log(response);
      // response.data.tmp_path
      this.form.pics.push({
        pic: response.data.tmp_path
      });
    },
    //点击tab就会触发
    async changeTab() {
      if (this.active === "2" || this.active === "3") {
        if (this.selectedOptions.length !== 3) {
          //提示
          this.$message.error("请先选择三级分类！");
          if (this.active === "2") {
            this.arrDy = [];
          } else {
            this.arrStatic = [];
          }
          return;
        }
        if (this.active === "3") {
          //获取静态数组
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=only`
          );
          console.log(res);
          const {
            meta: { msg, status },
            data
          } = res.data;
          if (status === 200) {
            this.arrStatic = data;
            console.log(this.arrStatic);
            // this.arrDy.forEach(item => {
            //   item.attr_vals =
            //     item.attr_vals.trim().length === 0
            //       ? []
            //       : item.attr_vals.trim().split(",");
            //   console.log(item.attr_vals);
            // });
          }
        }
        if (this.active === "2") {
          //获取动态参数数据
          const res = await this.$http.get(
            `categories/${this.selectedOptions[2]}/attributes?sel=many`
          );
          console.log(res);
          const {
            meta: { msg, status },
            data
          } = res.data;
          if (status === 200) {
            this.arrDy = data;
            console.log(this.arrDy);
            this.arrDy.forEach(item => {
              item.attr_vals =
                item.attr_vals.trim().length === 0
                  ? []
                  : item.attr_vals.trim().split(",");
              console.log(item.attr_vals);
            });
          }
        }
      }
    },
    //获取三级商品分类数据
    async getGoodsCate() {
      const res = await this.$http.get(`categories?type=3`);
      // console.log(res);
      const {
        meta: { msg, status },
        data
      } = res.data;
      if (status === 200) {
        this.options = data;
      }
    },
    handleChange() {}
  }
};
</script>

<style>
.box {
  height: 100%;
}
.alert {
  margin-top: 20px;
  margin-bottom: 20px;
}
.form {
  height: 350px;
  margin-top: 20px;
  overflow: auto;
}
.ql-editor,
.ql-blank {
  min-height: 180px;
}
</style>
