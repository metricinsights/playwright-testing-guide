import * as crypto from 'crypto';
import { apiInstance } from '../auth/auth';

// Function to create a Metric and return its ID
export async function createMetric(
  token: string,
  categoryId: number,
  busAndTechnicalOwner: string,
  dimensionId: number = 0,
) {
  const endpoint = `/api/metric`;
  const headers = {
    token: token,
  };
  const uniqueMetricName = `Playwright_Metric_${crypto.randomBytes(6).toString('hex')}`;
  const createMetric = {
    measurement_interval: 4,
    name: uniqueMetricName,
    description: 'Playwright_Metric_description',
    category: categoryId, // Use the categoryId from the previous setup
    business_owner_id: busAndTechnicalOwner,
    technical_owner_id: busAndTechnicalOwner,
    data_values: 'integer',
    for_this_metric: 'Y',
    data_source: '2_sql',
    data_collection_trigger: 10,
    dimension: dimensionId,
    data_fetch_command: 'select DATE_SUB(now(), INTERVAL 10 DAY), 1',
    aggregate_function: 'None',
    include_only_new_report_data: 'All Report data',
    dataset_id: 0,
    dataset_filter_id: 0,
    dataset_source: '0_0',
    ds_aggregate_function: 'None',
    stoplight_calculation_method: 'None',
    stoplight_compare_value_to: 1,
    compare_value_period: 0,
    compare_value_unit: 'week',
    stoplight_range_start: 0,
    stoplight_range_end: 0,
    metric_compare_value_range_method: 'fixed',
    metric_stoplight_range_start: 0,
    metric_stoplight_range_end: 0,
    metric_compare_value_range_percent: 0,
    chart_type: 'lines',
    use_different_color_bars_for_positive_vs_negative_values: 'the same color',
    moving_average_interval: '12 week',
    max_time_before_expired_period: 2,
    max_time_before_expired_unit: 'week',
    show_minimum_ever_line: 'N',
    chart_layout: 1,
    statistical_view_standard_deviations: 2,
    can_be_viewed_without_login: 'internal',
    project_value_of_partial_days: 'no',
    project_values_of_future_days: 'no',
    project_future_day_using: 'linear regression',
    metric_future_projection_reference_metric_id: '',
    baseline_trend_to_avg_of_prior: 1,
    extend_target_interval: 'N',
    target_view_extend_scope: 'current',
    include_metric_data_table_in_e_mail_digests: 'no',
    suppress_alerts_on_partial_period_data: 'yes',
    values_are_additive_across_time_periods: 'Y',
  };

  const responseCreateMetric = await apiInstance.post<{
    metric: { id: number; name: string };
  }>(endpoint, createMetric, { headers });

  return responseCreateMetric;
}

// Function to enable the created metric
export async function enableMetric(token: string, metricId: number) {
  const endpoint = `/api/metric/id/${metricId}`;
  const headers = {
    token: token,
  };
  const enableMetricPayload = {
    call: 'enable',
  };

  const responseEnableMetric = await apiInstance.put<{ message: string }>(endpoint, enableMetricPayload, { headers });

  return responseEnableMetric;
}

// Validate the created metric data
export async function validateMetricData(token: string, metricId: number) {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const endpoint = `/api/metric/id/${metricId}`;

  const headers = {
    token: token,
  };
  const validateMetricPayload = {
    call: 'validate',
    last_measurement_time: formattedDate,
  };

  const responseValidateMetricData = await apiInstance.put<{ message: string }>(endpoint, validateMetricPayload, {
    headers,
  });

  return responseValidateMetricData;
}

// Function to collect the created metric
export async function collectMetric(token: string, metricId: number) {
  const endpoint = `/api/metric/id/${metricId}`;
  const headers = {
    token: token,
  };
  const collectMetricPayload = {
    call: 'collect',
    compute_metric_values_after: '2019-01-01 00:00:00',
  };

  const responseCollectMetric = await apiInstance.put<{ message: string }>(endpoint, collectMetricPayload, { headers });

  return responseCollectMetric;
}

// Function to Update the created metric
export async function updateMetric(token: string, metricId: number) {
  const endpoint = `/api/metric/id/${metricId}`;
  const headers = {
    token: token,
  };
  const updateMetricPayload = {
    call: 'generate',
    compute_metric_values_after: '2019-01-01 00:00:00',
  };

  const responseUpdateMetric = await apiInstance.put<{ message: string }>(endpoint, updateMetricPayload, { headers });

  return responseUpdateMetric;
}

// Function to delete the Metric
export async function deleteMetric(token: string, metricId: number) {
  const endpoint = `/api/metric/id/${metricId}`;
  const headers = {
    token: token,
  };

  try {
    const responseDeleteMetric = await apiInstance.delete(endpoint, {
      headers: headers
    });

    // Log response for debugging
    console.log(`Delete response status: ${responseDeleteMetric.status}`);
    if (responseDeleteMetric.status !== 200) {
      console.error(`Error response: ${JSON.stringify(responseDeleteMetric.data)}`);
    }

    return responseDeleteMetric;
  } catch (error) {
    // Handle 404 errors silently (metric already deleted)
    const axiosError = error as { response?: { status?: number; data?: unknown } };
    if (axiosError.response?.status === 404) {
      // Return a mock successful response for 404s
      return {
        status: 200,
        data: { message: 'Metric already deleted (404)' }
      };
    }

    // Log other errors normally
    console.error(`Failed to delete metric ${metricId}:`, error);
    if (axiosError.response) {
      console.error(`Error status: ${axiosError.response.status}`);
      console.error(`Error data: ${JSON.stringify(axiosError.response.data)}`);
    }
    throw error;
  }
}
