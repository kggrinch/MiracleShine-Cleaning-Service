jest.mock('../../../src/prisma/prisma.service.js', () => ({
  PrismaService: class PrismaService {},
}));

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateQuoteRequestDto } from '../../../src/modules/quote-requests/quote-requests.service.js';
import { CreateReviewDto } from '../../../src/modules/reviews/reviews.service.js';
import { ChangePasswordDto } from '../../../src/modules/users/users.service.js';

describe('request DTO validation', () => {
  it('rejects malformed quote email and missing required location fields', async () => {
    const dto = plainToInstance(CreateQuoteRequestDto, {
      customerFirstName: 'Ava',
      customerLastName: 'Smith',
      customerEmail: 'not-an-email',
      propertyType: 'HOUSE',
      streetAddress: '',
      city: 'Seattle',
      state: 'WA',
      postalCode: '98101',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['customerEmail', 'streetAddress']),
    );
  });

  it('rejects a review rating outside the supported range', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      quoteRequestId: 'quote-request-1',
      rating: 6,
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('rating');
  });

  it('requires all change-password fields and an eight-character new password', async () => {
    const missingFields = plainToInstance(ChangePasswordDto, {});
    const missingErrors = await validate(missingFields);
    expect(missingErrors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        'currentPassword',
        'newPassword',
        'confirmNewPassword',
      ]),
    );

    const shortPassword = plainToInstance(ChangePasswordDto, {
      currentPassword: 'CurrentPassword123',
      newPassword: 'short',
      confirmNewPassword: 'short',
    });
    const shortErrors = await validate(shortPassword);
    expect(shortErrors.map((error) => error.property)).toContain('newPassword');
  });
});
