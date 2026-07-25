import { plainToInstance } from 'class-transformer';
import { FindProductsDto } from './find-products.dto';

describe('FindProductsDto', () => {
  it('parses the string "false" as boolean false', () => {
    const dto = plainToInstance(FindProductsDto, { isActive: 'false' });
    expect(dto.isActive).toBe(false);
  });

  it('parses the string "true" as boolean true', () => {
    const dto = plainToInstance(FindProductsDto, { isFeatured: 'true' });
    expect(dto.isFeatured).toBe(true);
  });

  it('leaves isActive/isFeatured undefined when absent so no filter is applied', () => {
    const dto = plainToInstance(FindProductsDto, {});
    expect(dto.isActive).toBeUndefined();
    expect(dto.isFeatured).toBeUndefined();
  });
});
