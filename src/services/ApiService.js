// services/ApiService.js
import axios from "axios";

const tableApiUrl = process.env.REACT_APP_API_URL; // using relative path via reverse proxy

const ApiService = {
  /**
   * Fetches a list of available tables.
   * @returns {Promise<Object[]>} List of tables.
   */
  getTables: async () => {
    try {
      const response = await axios.get(`${tableApiUrl}/tables`);
      return response.data;
    } catch (error) {
      console.error("Error fetching tables:", error);
      throw error;
    }
  },

  /**
   * Fetches metadata for a specific table.
   * @param {String} tableName Technical name of the table.
   * @returns {Promise<Object>} Table metadata.
   */
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
   * Fetches column definitions for a table.
   * @param {String} tableName Name of the table to get columns for.
   * @returns {Promise<Object[]>} Column metadata.
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
   * Fetches row data for a table using query parameters.
   * @param {Object} parms Request parameters.
   * @param {String} [parms.sys_id] Optional sys_id to filter by.
   * @param {String} [parms.sysparm_query] Optional query string.
   * @param {String} [parms.sysparm_fields] Optional comma-separated fields to return.
   * @param {String} parms.table_name Technical name of the table.
   * @returns {Promise<Object[]>} Row data for the specified table.
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
   * Inserts a new row into the specified table.
   * @param {String} tableName Technical name of the table.
   * @param {Object} newData Key-value pairs to insert into the table.
   * @returns {Promise<Object>} Created row response.
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
   * Deletes a row from the specified table.
   * @param {String} tableName Technical name of the table.
   * @param {Object} record Parameters identifying the row to delete.
   * @returns {Promise<Object>} Delete response.
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

  /**
   * Resolves a reference field value to its sys_name.
   * @param {String} tableName Technical name of the reference table.
   * @param {String} value Value to resolve.
   * @param {String} reference_key Reference key name.
   * @returns {Promise<Object>} sys_name result.
   */
  getSysName: async (tableName, value, reference_key) => {
    const uri = `${tableApiUrl}/getSysName/${tableName}?value=${value}&reference_key=${reference_key}`;
    try {
      const response = await axios.get(uri);
      return response.data;
    } catch (error) {
      console.error("Error fetching sys_name:", error);
      throw error;
    }
  },

  /**
   * Fetches a reference key for a sys_id.
   * @param {String} sys_id The sys_id to resolve.
   * @returns {Promise<Object>} Reference key result.
   */
  getReferenceKey: async (sys_id) => {
    const uri = `${tableApiUrl}/getReferenceKey/${sys_id}`;
    try {
      const response = await axios.get(uri);
      return response.data;
    } catch (error) {
      console.error("Error fetching reference key:", error);
      throw error;
    }
  },
};

export default ApiService;
