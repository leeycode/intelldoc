import Vue from 'vue';
import {
  Button,
  Layout,
  Icon,
  Menu,
  Dropdown,
  Breadcrumb,
  Form,
  FormModel,
  Input,
  Select,
  DatePicker,
  Table,
  Tabs,
  Tag,
  Checkbox,
  Radio,
  Switch,
  Upload,
  Modal,
  Tooltip,
  Popconfirm,
  message,
  notification,
  Card,
  Drawer,
  Divider,
  List,
  Avatar,
  ConfigProvider,
  Pagination,
  Steps,
  Spin,
  Empty,
  Collapse,
  TreeSelect,
  PageHeader,
  Result,
  Row,
  Col,
  Alert,
  Badge,
  Descriptions,
  Rate,
  Progress
} from 'ant-design-vue';

Vue.use(Button);
Vue.use(Layout);
Vue.use(Icon);
Vue.use(Menu);
Vue.use(Dropdown);
Vue.use(Breadcrumb);
Vue.use(Form);
Vue.use(FormModel);
Vue.use(Input);
Vue.use(Select);
Vue.use(DatePicker);
Vue.use(Table);
Vue.use(Tabs);
Vue.use(Tag);
Vue.use(Checkbox);
Vue.use(Radio);
Vue.use(Switch);
Vue.use(Upload);
Vue.use(Modal);
Vue.use(Tooltip);
Vue.use(Popconfirm);
Vue.use(Card);
Vue.use(Drawer);
Vue.use(Divider);
Vue.use(List);
Vue.use(Avatar);
Vue.use(ConfigProvider);
Vue.use(Pagination);
Vue.use(Steps);
Vue.use(Spin);
Vue.use(Empty);
Vue.use(Collapse);
Vue.use(TreeSelect);
Vue.use(PageHeader);
Vue.use(Result);
Vue.use(Row);
Vue.use(Col);
Vue.use(Alert);
Vue.use(Badge);
Vue.use(Descriptions);
Vue.use(Rate);
Vue.use(Progress);

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm; 