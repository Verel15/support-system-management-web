import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="flex h-full min-h-full flex-col items-center justify-center gap-8 px-6 py-10 lg:flex-row lg:gap-16"
    >
      <img
        ngSrc="/images/not_found.png"
        width="1372"
        height="1146"
        alt="ไม่พบหน้าที่ค้นหา"
        priority
        class="h-auto w-full max-w-md object-contain"
      />

      <div
        class="flex max-w-md flex-col items-center gap-4 text-center lg:items-start lg:text-left"
      >
        <p
          class="bg-linear-to-r from-primary-500 to-sky-500 bg-clip-text text-6xl font-extrabold text-transparent"
        >
          Oops!
        </p>
        <h1 class="text-2xl font-bold text-secondary-800">
          ไม่พบหน้าที่คุณค้นหา
        </h1>
        <p class="text-secondary-500">
          หน้าที่คุณพยายามเข้าถึงอาจถูกย้าย ลบ หรือไม่มีอยู่จริง
        </p>
        <p-button
          label="กลับสู่หน้าหลัก"
          icon="pi pi-arrow-left"
          (onClick)="goHome()"
        />
      </div>
    </main>
  `,
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/my-tickets']);
  }
}
