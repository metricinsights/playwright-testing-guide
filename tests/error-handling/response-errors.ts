import { apiInstance } from '../utils/auth';
import axios from 'axios';

export const response412Id = process.env.RESPONSE412_ID;

const expiredToken = process.env.EXPIRED_TOKEN;

export const allGet = [
  '/api/business_owner',
  `/api/report/id/${response412Id}`,
  `/api/report_data?report=${response412Id}`,
  `/api/report_type`,
  `/api/stoplight_calculation_method`,
  `/api/stoplight_compare_value_to`,
  `/api/stoplight_target`,
  //`/api/target/id/${response412Id}`,
  `/api/technical_owner`,
  `/api/topic`,
  `/api/user/id/${response412Id}`,
  `/api/user_dimension?user=${response412Id}`,
  `/api/user_dimension_value?user=${response412Id}`,
  `/api/user_element?user=${response412Id}`,
  `/api/user_group/id/${response412Id}`,
  `/api/user_group_member?group=${response412Id}`,
  `/api/user_preference?user=${response412Id}`,
  `/api/user_preference_mobile?user=${response412Id}`,
  `/api/user_preference_catalog?user=${response412Id}`,
  `/api/search?scope=accessible only&thumbnail=Y`,
  `/api/search_history`,
  `/api/slack_channel`,
  `/api/msteams`,
  `/api/measurement_interval`,
  `/api/metric/id/${response412Id}`,
  `/api/metric_alert/id/${response412Id}`,
  `/api/metric_annotation?element=${response412Id}`,
  `/api/metric_annotation_comment`,
  `/api/metric_association`,
  `/api/metric_compare_line?element=${response412Id}`,
  `/api/metric_data`,
  `/api/metric_element?element=${response412Id}`,
  `/api/metric_impacted?element=${response412Id}&dimension_value=${response412Id}`,
  `/api/metric_report?element=${response412Id}`,
  `/api/note/id/${response412Id}`,
  `/api/notification_schedule`,
  `/api/page/id/${response412Id}`,
  `/api/page_template`,
  `/api/page_template/id/${response412Id}`,
  `/api/get_image`,
  `/api/get_token`,
  `/api/glossary_term/id/${response412Id}`,
  `/api/group_dimension?group=${response412Id}`,
  `/api/group_dimension_value?group=${response412Id}`,
  `/api/group_element?group=${response412Id}`,
  `/api/folder_element?folder_id=${response412Id}`,
  `/api/element`,
  `/api/element_info`,
  `/api/element_views`,
  `/api/email`,
  `/api/event/id/${response412Id}`,
  `/api/event_calendar`,
  `/api/external_content/id/${response412Id}`,
  `/api/external_report/id/${response412Id}`,
  `/api/external_report_reference`,
  `/api/external_report_template`,
  `/api/external_report_template/id/${response412Id}`,
  `/api/favorite/id/${response412Id}`,
  `/api/favorite_element?favorite=${response412Id}`,
  `/api/folder/id/${response412Id}`,
  `/api/folder_element`,
  `/api/dimension`,
  `/api/dimension_value?dimension=${response412Id}`,
  `/api/display_mask`,
  `/api/dataset_data?dataset=${response412Id}`,
  `/api/dataset/id/${response412Id}`,
  `/api/dataset_instance?dataset=${response412Id}`,
  `/api/data_source_sql/id/${response412Id}`,
  `/api/data_source_plugin`,
  `/api/data_source_parameter?profile=${response412Id}`,
  `/api/data_source_external_report?profile=${response412Id}`,
  `/api/data_source_external_rollup?profile=${response412Id}`,
  `/api/data_source`,
  `/api/data_collection_trigger`,
  `/api/category`,
  `/api/chatbot_data`,
  `/api/chatbot_alias`,
  `/api/chatbot_setting`,
  `/api/chatbot_stopword`,
  `/api/chatbot_channel_setting/id/${response412Id}`,
  `/api/compare_line_compare_to`,
  `/api/currency`,
  `/api/custom_effective_date`,
  `/api/custom_field`,
  `/api/custom_field_value/id/${response412Id}`,
  `/api/burst/id/${response412Id}`,
  `/api/announcement/`,
  `/api/announcement_group?announcement_id=${response412Id}`,
  `/api/announcement_folder?announcement_id=${response412Id}`,
  `/api/announcement_element?announcement_id=${response412Id}`,
  `/api/announcement_datasource?announcement_id=${response412Id}`,
  `/api/announcement_category?announcement_id=${response412Id}`,
  `/api/alert_rule_scope_category?alert_rule=${response412Id}`,
  `/api/alert_rule_scope_element`,
  `/api/alert_rule?element=${response412Id}`,
  `/api/alert_rule_group_share`,
  `/api/alert_rule_user_share`,
  `/api/alert_subscription`,
  `/api/group_announcement`,
  `/api/custom_field_info`,
];

export const allPost = [
  `/api/report/`,
  `/api/share/`,
  //`/api/target/`,
  `/api/user/`,
  `/api/user_dimension/`,
  `/api/user_dimension_value/`,
  `/api/user_element/`,
  `/api/user_group/`,
  `/api/user_group_member/`,
  `/api/metric/`,
  `/api/metric_annotation/`,
  `/api/metric_compare_line/`,
  `/api/metric_element/`,
  `/api/metric_report/`,
  `/api/note/`,
  `/api/page/`,
  `/api/glossary_term/`,
  `/api/group_dimension/`,
  `/api/group_dimension_value/`,
  `/api/group_element/`,
  `/api/event/`,
  `/api/event_calendar/`,
  `/api/external_content/`,
  `/api/external_report/`,
  `/api/external_report_template/`,
  `/api/favorite/`,
  `/api/favorite_element/`,
  `/api/folder/`,
  `/api/folder_element/`,
  `/api/dimension/`,
  `/api/dimension_value?dimension=${response412Id}`,
  `/api/dataset_data`,
  `/api/dataset/`,
  `/api/data_source_sql/`,
  `/api/data_collection_trigger/`,
  `/api/category/`,
  `/api/chatbot_channel_setting/`,
  `/api/burst_item/`,
  `/api/burst`,
  `/api/announcement_group`,
  `/api/announcement_folder/`,
  `/api/announcement_element/`,
  `/api/announcement_datasource/`,
  `/api/announcement_category/`,
  `/api/alert_rule_scope_category/`,
  `/api/alert_rule_scope_element/`,
  `/api/alert_rule`,
  `/api/alert_rule_group_share`,
  `/api/alert_rule_user_share/`,
  `/api/group_announcement`,
  `/api/share/`,
];

export const allPut = [
  //`/api/target/id/${response412Id}`,
  `/api/user/id/${response412Id}`,
  `/api/user_group/id/${response412Id}`,
  `/api/user_preference?user=${response412Id}`,
  `/api/user_preference_mobile?user=${response412Id}`,
  `/api/user_preference_catalog?user=${response412Id}`,
  `/api/search_history`,
  `/api/metric/id/${response412Id}`,
  `/api/metric_alert/id/${response412Id}`,
  `/api/metric_annotation?element=${response412Id}`,
  `/api/note/id/${response412Id}`,
  `/api/page/id/${response412Id}`,
  `/api/page_template/id/${response412Id}`,
  `/api/element_info?category=${response412Id}`,
  `/api/email/id/${response412Id}`,
  `/api/event/id/${response412Id}`,
  `/api/event_calendar/id/${response412Id}`,
  `/api/external_content/id/${response412Id}`,
  `/api/external_report/id/${response412Id}`,
  `/api/external_report_template/id/${response412Id}`,
  `/api/folder/id/${response412Id}`,
  `/api/dimension/id/${response412Id}`,
  `/api/dimension_value?dimension=${response412Id}`,
  `/api/dataset_data`,
  `/api/dataset/id/${response412Id}`,
  `/api/data_source_sql/id/${response412Id}`,
  `/api/data_source_plugin/id/${response412Id}`,
  `/api/data_collection_trigger/id/${response412Id}`,
  `/api/category`,
  `/api/chatbot_channel_setting/id/${response412Id}`,
  `/api/custom_field_value/id/${response412Id}`,
  `/api/burst/id/${response412Id}`,
  `/api/announcement/`,
  `/api/alert_rule`,
];

export const allDelete = [
  `/api/report/id/${response412Id}`,
  //`/api/target/id/${response412Id}`,
  `/api/user/id/${response412Id}`,
  `/api/user_dimension?user=${response412Id}`,
  `/api/user_dimension_value?user=${response412Id}`,
  `/api/user_element?user=${response412Id}`,
  `/api/user_group/id/${response412Id}`,
  `/api/user_group_member?group=${response412Id}`,
  `/api/metric/id/${response412Id}`,
  `/api/metric_annotation?element=${response412Id}`,
  `/api/metric_compare_line?element=${response412Id}`,
  `/api/metric_element?element=${response412Id}`,
  `/api/metric_report?element=${response412Id}`,
  `/api/note/id/${response412Id}`,
  `/api/page/id/${response412Id}`,
  `/api/glossary_term/id/${response412Id}`,
  `/api/group_dimension?group=${response412Id}`,
  `/api/group_dimension_value?group=${response412Id}`,
  `/api/group_element?group=${response412Id}`,
  `/api/event/id/${response412Id}`,
  `/api/event_calendar/id/${response412Id}`,
  `/api/external_content/id/${response412Id}`,
  `/api/external_report/id/${response412Id}`,
  `/api/favorite/id/${response412Id}`,
  `/api/favorite_element?favorite=${response412Id}`,
  `/api/folder/id/${response412Id}`,
  `/api/folder_element`,
  `/api/dimension/id/${response412Id}`,
  `/api/dimension_value?dimension=${response412Id}`,
  `/api/dataset/id/${response412Id}`,
  `/api/data_source_sql/id/${response412Id}`,
  `/api/data_collection_trigger/id/${response412Id}`,
  `/api/category`,
  `/api/chatbot_channel_setting/id/${response412Id}`,
  `/api/burst_item?burst=${response412Id}`,
  `/api/burst/id/${response412Id}`,
  `/api/announcement/`,
  `/api/announcement_group`,
  `/api/announcement_folder/`,
  `/api/announcement_element/`,
  `/api/announcement_datasource/`,
  `/api/announcement_category/`,
  `/api/alert_rule_scope_category/id/${response412Id}`,
  `/api/alert_rule_scope_element`,
  `/api/alert_rule`,
  `/api/alert_rule_group_share`,
  `/api/alert_rule_user_share`,
  `/api/group_announcement/id/${response412Id}`,
];

export async function getRequests(url: string, withToken: boolean = true) {
  try {
    await apiInstance.get(`${url}`, {
      headers: withToken ? { Token: expiredToken } : {},
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

export async function postRequests(url: string, withToken: boolean = true) {
  try {
    await apiInstance.post(
      `${url}`,
      {},
      {
        headers: withToken ? { Token: expiredToken } : {},
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

export async function putRequests(url: string, withToken: boolean = true) {
  try {
    await apiInstance.put(
      `${url}`,
      {},
      {
        headers: withToken ? { Token: expiredToken } : {},
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}

export async function deleteRequests(url: string, withToken: boolean = true) {
  try {
    await apiInstance.delete(`${url}`, {
      headers: withToken ? { Token: expiredToken } : {},
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
