<template>
  <el-card class="box">
    <!-- 面包屑 -->
    <cus-bread level1="用户管理" level2="用户列表"></cus-bread>
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
    <el-table v-loading="loading" :data="list" style="width: 100%">
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
          <el-switch
            @change="changeState(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            @click="showDiaEditUser(scope.row)"
            type="primary"
            icon="el-icon-edit"
            circle
            size="mini"
            plain
          ></el-button>
          <el-button
            @click="showMsgBoxDele(scope.row)"
            type="danger"
            icon="el-icon-delete"
            circle
            size="mini"
            plain
          ></el-button>
          <el-button
            @click="showDiaSetRole(scope.row)"
            type="success"
            icon="el-icon-check"
            circle
            size="mini"
            plain
          ></el-button>
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
    <!-- 对话框--添加用户 -->
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
    <!-- 对话框--编辑用户 -->
    <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit">
      <el-form label-position="right" label-width="80px" :model="fmdata">
        <el-form-item label="用户名">
          <el-input v-model="fmdata.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="fmdata.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="fmdata.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 对话框--分配角色 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRole">
      <el-form label-position="right" label-width="80px" :model="fmdata">
        <el-form-item label="用户名">{{fmdata.username}}</el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectVal" placeholder="请选择角色">
            <el-option label="请选择" :value="-1" disabled></el-option>
            <!-- 获取角色数据 -->
            <el-option
              v-for="(item) in roles"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      query: "",
      pagenum: 1,
      pagesize: 2,
      total: -1,
      // 表格数据
      list: [],
      // 对话框数据
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRole: false,
      fmdata: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 下拉框的数据
      selectVal: -1,
      currUserId: -1,
      roles: []
    };
  },
  created() {
    console.log(this.$http);

    this.getTableData();
  },
  methods: {
    // 分配角色--发送请求
    async setRole() {
      const res = await this.$http.put(`users/${this.currUserId}/role`, {
        rid: this.selectVal
      });
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        // 关闭对话框
        this.dialogFormVisibleRole = false;
        this.getTableData();
      }
    },
    // 分配角色--打开对话框
    async showDiaSetRole(user) {
      this.fmdata = user;
      this.currUserId = user.id;
      this.dialogFormVisibleRole = true;
      // 获取角色名称
      const res = await this.$http.get(`roles`);
      console.log(res);
      this.roles = res.data.data;
      const res2 = await this.$http.get(`users/${user.id}`);
      // 给下拉框v-model绑定的selectVal赋值
      this.selectVal = res2.data.data.rid;
    },
    // 修改状态
    async changeState(user) {
      const res = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      console.log(res);
    },
    // 编辑用户
    async editUser() {
      const res = await this.$http.put(`users/${this.fmdata.id}`, this.fmdata);
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 200) {
        // 关闭对话框
        this.dialogFormVisibleEdit = false;
        // 更新表格
        this.getTableData();
      }
    },
    showDiaEditUser(user) {
      // 获取当前的用户数据
      this.fmdata = user;
      this.dialogFormVisibleEdit = true;
    },
    // 删除用户
    showMsgBoxDele(user) {
      // console.log(user);

      this.$confirm("是否删除该用户?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const res = await this.$http.delete(`users/${user.id}`);
          // console.log(res);
          const {
            meta: { msg, status }
          } = res.data;
          if (status === 200) {
            this.$message.success("msg");
            this.pagenum = 1;
            this.getTableData();
          }
        })
        .catch(() => {
          this.$message.success("已取消删除");
        });
    },
    // 添加用户
    async addUser() {
      // 发送请求
      const res = await this.$http.post(`users`, this.fmdata);
      console.log(res);
      const {
        meta: { msg, status }
      } = res.data;
      if (status === 201) {
        // 关闭对话框
        this.dialogFormVisibleAdd = false;
        // 更新表格
        this.getTableData();
      }
    },
    // 添加用户-打开对话框
    showDiaAddUser() {
      this.dialogFormVisibleAdd = true;
      this.fmdata = {};
    },
    // 清空时获取所有的数据
    getAllUsers() {
      this.getTableData();
    },
    // 搜索用户
    searchUser() {
      this.pagenum = 1;
      this.getTableData();
    },
    // 分页相关的方法
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
      // const AUTH_TOKEN = localStorage.getItem("token");
      // this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;

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
        this.loading = false;
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
