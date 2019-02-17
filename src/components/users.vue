<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索+添加 -->
    <el-row class="seartBox">
      <el-col>
        <!-- 搜索 -->
        <el-input
          @clear="getAllUsers()"
          clearable
          placeholder="请输入内容"
          v-model="query"
          class="searchInput"
        >
          <el-button @click="searchUser()" slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <!-- 添加按钮 -->
        <el-button type="success" @click="showDiaAddUser()">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="list" style="width: 100%">
      <el-table-column prop="id" label="#" width="80"></el-table-column>
      <el-table-column prop="username" label="姓名" width="120"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="140"></el-table-column>
      <el-table-column prop="mobile" label="电话" width="140"></el-table-column>

      <!-- 日期格式处理-过滤器-2类+3步 
      Vue.filter()
      fmdata-->
      <el-table-column prop="create_time" label="创建日期" width="140">
        <template slot-scope="scope">{{scope.row.create_time|fmdata}}</template>
      </el-table-column>

      <el-table-column prop="mg_state" label="用户状态" width="140">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" circle size="mini" plain></el-button>
          <el-button type="danger" icon="el-icon-delete" circle size="mini" plain></el-button>
          <el-button type="success" icon="el-icon-check" circle size="mini" plain></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 
    @size-change 每页条数改变时
    @current-change 页码改变时
    current-page 当前显示第几页
    page-sizes 每页条数的不同情况
    layout 附加功能
    total 一共数据的条数
    -->
    <el-pagination
      class="page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8]"
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <el-form label-position="right" label-width="80px" :model="fmdata">
        <el-form-item label="用户名">
          <el-input v-model="fmdata.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="fmdata.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="fmdata.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="fmdata.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 2,
      total: -1,
      //表格数据
      list: [],
      //对话框数据
      dialogFormVisibleAdd: false,
      fmdata: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      }
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    //添加用户
    async addUser() {
      //发送请求
      const res = await this.$http.post(`users`, this.fmdata);
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 201) {
        //关闭对话框
        this.dialogFormVisibleAdd = false;
        //更新表格
        this.getTableData();
      }
    },
    //添加用户-打开对话框
    showDiaAddUser() {
      this.dialogFormVisibleAdd = true;
      this.fmdata = {};
    },
    //清空时获取所有的数据
    getAllUsers() {
      this.getTableData();
    },
    //搜索用户
    searchUser() {
      this.pagenum = 1;
      this.getTableData();
    },
    //分页相关的方法
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pagenum = 1;
      this.pagesize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.getTableData();
    },
    // 获取表格数据
    async getTableData() {
      const AUTH_TOKEN = localStorage.getItem("token");
      this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;

      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${
          this.pagesize
        }`
      );
      // console.log(res);

      const {
        data,
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        this.total = data.total;
        this.list = data.users;
        // console.log(this.list);
      }
    }
  }
};
</script>

<style>
.box {
  height: 100%;
}
.seartBox {
  margin-top: 20px;
}
.searchInput {
  width: 350px;
}
.page {
  margin-top: 20px;
}
</style>
