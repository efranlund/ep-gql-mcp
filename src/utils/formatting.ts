/**
 * Response Formatting Utilities
 * 
 * Truncation, pagination metadata, URL generation
 */

const MAX_RESPONSE_LENGTH = 50000; // Characters
const MAX_ITEMS_DEFAULT = 50;

export interface PaginationInfo {
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
}

export interface FormattedResponse {
  data: unknown;
  pagination?: PaginationInfo;
  truncated?: boolean;
  note?: string;
}

/**
 * Truncate large responses with a note
 */
export function truncateResponse(
  data: unknown,
  maxLength: number = MAX_RESPONSE_LENGTH
): { data: unknown; truncated: boolean; note?: string } {
  const jsonString = JSON.stringify(data, null, 2);
  
  if (jsonString.length <= maxLength) {
    return { data, truncated: false };
  }

  // Try to truncate arrays intelligently
  if (Array.isArray(data) && data.length > 0) {
    const itemLength = JSON.stringify(data[0], null, 2).length;
    const maxItems = Math.floor((maxLength - 200) / itemLength); // Reserve space for metadata
    
    if (maxItems > 0 && maxItems < data.length) {
      return {
        data: data.slice(0, maxItems),
        truncated: true,
        note: `Response truncated. Showing ${maxItems} of ${data.length} items. Use pagination (limit/offset) to get more results.`,
      };
    }
  }

  // Fallback: truncate string
  const truncated = jsonString.substring(0, maxLength - 100);
  return {
    data: JSON.parse(truncated + "..."),
    truncated: true,
    note: `Response truncated due to size. Original response was ${jsonString.length} characters.`,
  };
}

/**
 * Add pagination metadata to response
 */
export function addPaginationMetadata(
  data: unknown[],
  total?: number,
  limit?: number,
  offset?: number
): FormattedResponse {
  const hasMore = total !== undefined && limit !== undefined && offset !== undefined
    ? offset + data.length < total
    : undefined;

  return {
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore,
    },
  };
}

/**
 * Generate EliteProspects URL for an entity
 */
export function generateEntityUrl(
  type: "player" | "team" | "league" | "staff",
  id: string | number,
  slug?: string
): string {
  const baseUrl = "https://www.eliteprospects.com";
  const typePath = type === "staff" ? "staff" : type;
  
  if (slug) {
    return `${baseUrl}/${typePath}/${id}/${slug}`;
  }
  return `${baseUrl}/${typePath}/${id}`;
}

/**
 * Format response with truncation and pagination
 */
export function formatResponse(
  data: unknown,
  options?: {
    maxLength?: number;
    total?: number;
    limit?: number;
    offset?: number;
    entityType?: "player" | "team" | "league" | "staff";
    entityId?: string | number;
    entitySlug?: string;
  }
): string {
  const { maxLength, total, limit, offset, entityType, entityId, entitySlug } = options || {};
  
  // Truncate if needed
  const { data: truncatedData, truncated, note } = truncateResponse(data, maxLength);
  
  // Add pagination if applicable
  let response: FormattedResponse;
  if (Array.isArray(truncatedData)) {
    response = addPaginationMetadata(truncatedData, total, limit, offset);
  } else {
    response = { data: truncatedData };
  }
  
  // Add truncation note
  if (truncated && note) {
    response.truncated = true;
    response.note = note;
  }
  
  // Add entity URL if provided
  if (entityType && entityId) {
    const url = generateEntityUrl(entityType, entityId, entitySlug);
    response = {
      ...response,
      url,
    };
  }
  
  return JSON.stringify(response, null, 2);
}

