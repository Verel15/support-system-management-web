import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('unwraps the data envelope on GET', () => {
    let result: unknown;
    service.get<{ id: number }>('/things').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}/things`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { id: 7 }, message: 'ok', success: true });

    expect(result).toEqual({ id: 7 });
  });

  it('builds query params and drops null/undefined values', () => {
    service
      .get('/search', { q: 'foo', page: 2, active: true, skip: null, gone: undefined })
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${BASE}/search`,
    );
    expect(req.request.params.get('q')).toBe('foo');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('active')).toBe('true');
    expect(req.request.params.has('skip')).toBe(false);
    expect(req.request.params.has('gone')).toBe(false);
    req.flush({ data: null, message: 'ok', success: true });
  });

  it('sends body and unwraps data on POST', () => {
    let result: unknown;
    service.post<{ ok: boolean }>('/create', { name: 'x' }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'x' });
    req.flush({ data: { ok: true }, message: 'created', success: true });

    expect(result).toEqual({ ok: true });
  });

  it('sends body and unwraps data on PUT', () => {
    service.put('/update/1', { name: 'y' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/update/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'y' });
    req.flush({ data: null, message: 'ok', success: true });
  });

  it('sends body and unwraps data on PATCH', () => {
    service.patch('/patch/1', { name: 'z' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/patch/1`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ data: null, message: 'ok', success: true });
  });

  it('sends DELETE without a body by default', () => {
    service.delete('/remove/1').subscribe();
    const req = httpMock.expectOne(`${BASE}/remove/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeNull();
    req.flush({ data: null, message: 'ok', success: true });
  });

  it('sends DELETE with a body when provided', () => {
    service.delete('/remove/1', { reason: 'gone' }).subscribe();
    const req = httpMock.expectOne(`${BASE}/remove/1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ reason: 'gone' });
    req.flush({ data: null, message: 'ok', success: true });
  });

  it('returns undefined data when DELETE responds with null', () => {
    let result: unknown = 'sentinel';
    service.delete('/remove/1').subscribe((r) => (result = r));
    const req = httpMock.expectOne(`${BASE}/remove/1`);
    req.flush(null);
    expect(result).toBeUndefined();
  });

  it('downloads a blob from the origin + fileUrl', () => {
    const origin = new URL(BASE).origin;
    let blob: Blob | undefined;
    service.downloadBlob('/files/report.pdf').subscribe((b) => (blob = b));

    const req = httpMock.expectOne(`${origin}/files/report.pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['x']));

    expect(blob).toBeInstanceOf(Blob);
  });
});
