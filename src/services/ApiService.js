// services/ApiService.js
import axios from "axios";

const tableApiUrl = "http://localhost:3001/api/table";

const ApiService = {
  getTables: async () => {
    try {
      const response = await axios.get(`${tableApiUrl}/tables`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  },

  getTable: async (tableName) => {
    const uri = `${tableApiUrl}/table_info/${tableName}`;
    try {
      const response = await axios.get(uri);
      return response.data;
    } catch (error) {
      console.error("Error fetching table:", error);
      throw error;
    }
  },

  /**
   * @param {String} tableName name of the table to get columns for
   */
  getColumns: async (tableName) => {
    const uri = `${tableApiUrl}/columns/${tableName}`;
    try {
      const response = await axios.get(uri);
      return response.data;
    } catch (error) {
      console.error("Error fetching columns:", error);
      throw error;
    }
  },

  /**
   * @param {Object} parms contains sys_id, tableName, and optionally sysparm_fields (comma-separated string of column names)
   */
  getData: async (parms) => {
    let p = {};
    p.sys_id = (parms.sys_id) ? parms.sys_id : "";
    p.sysparm_query = (parms.sysparm_query) ? parms.sysparm_query : "";
    // Pass sysparm_fields directly if provided as a string
    if (parms.sysparm_fields && typeof parms.sysparm_fields === 'string') {
      p.sysparm_fields = parms.sysparm_fields;
    }

    const uri = `${tableApiUrl}/rows/${parms.table_name}`;
    try {
      const response = await axios.get(uri, {params: p});
      return response.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },

  /**
   * @param {String} tableName technical name of the table
   * @param {Object} newData key:value to insert into table
   */
  addData: async (tableName, newData) => {
    const uri = `${tableApiUrl}/rows/${tableName}`;
    try {
      const response = await axios.post(uri, newData, {
        params: { sys_id: newData.sys_id },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding rows:", error);
      throw error;
    }
  },

  /**
   * @param {String} tableName technical name of the table
   * @param {Object} record document to delete
   */
  deleteData: async (tableName, record) => {
    const uri = `${tableApiUrl}/rows/${tableName}`;
    try {
      const response = await axios.delete(uri, { params: record });
      return response.data;
    } catch (error) {
      console.error("Error delete data:", error);
      throw error;
    }
  },
};

export default ApiService;
