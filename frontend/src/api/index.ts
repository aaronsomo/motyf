export async function request<T = {}>(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(
    input,
    init
      ? {
          credentials: 'include',
          ...init,
        }
      : undefined
  );

  if (!response.ok) {
    throw new Error(`An error occurred: ${response.status} ${response.statusText}`);
  }

  const body = await (response.json() as Promise<{ status: string; error?: string } & T>);

  if (body.status !== 'success') {
    console.log(body);
    console.log(body.status);
    throw new Error(body.error);
  }

  return body as T;
}

export async function request_post<T>(input: RequestInfo, data: any) {
  return request<T>(input, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
}

export async function request_put<T>(input: RequestInfo, data: any) {
  return request<T>(input, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function request_delete<T>(input: RequestInfo, data?: any) {
  return request<T>(input, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}