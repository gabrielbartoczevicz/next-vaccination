import { InvalidVaccinationPoint } from '@entities/vaccination-point/errors';
import { ICoordinateProps, ILocationProps } from '@entities/vaccination-point/values';
import { left, right } from '@server/shared';
import { DocumentAlreadyInUse, LocationAlreadyInUse } from '@usecases/errors';
import { InfraError } from '@usecases/output-ports/errors';
import { FakeVaccinationPointsRepository } from '@usecases/output-ports/repositories/vaccination-points';
import { VaccinationPoint } from '@entities/vaccination-point';
import { CreateVaccinationPointUseCase } from './create-vaccination-point';

const makeSut = () => {
  const fakeVaccinationPointsRepository = new FakeVaccinationPointsRepository();

  return {
    sut: new CreateVaccinationPointUseCase(fakeVaccinationPointsRepository),
    fakeVaccinationPointsRepository
  };
};

const makeFixture = (
  name = 'Point',
  phone = '0000-0000',
  document = 'document',
  latitude = 41.40338,
  longitude = 2.17403
) => ({
  name,
  document,
  phone,
  location: {
    address: 'Avenida Inglaterra',
    addressNumber: 20,
    coordinate: {
      latitude,
      longitude
    } as ICoordinateProps
  } as ILocationProps
});

describe('Create Vaccination Point usecase Unitary Tests', () => {
  it('should create a vaccination point', async () => {
    const { sut, fakeVaccinationPointsRepository } = makeSut();

    jest
      .spyOn(fakeVaccinationPointsRepository, 'findByDocument')
      .mockImplementation(() => Promise.resolve(right(null)));

    jest
      .spyOn(fakeVaccinationPointsRepository, 'findByCoordinate')
      .mockImplementation(() => Promise.resolve(right(null)));

    const testable = await sut.execute(makeFixture());

    expect(testable.isRight()).toBeTruthy();

    const vaccinationPoint = testable.value as VaccinationPoint;

    expect(vaccinationPoint.name).toEqual('Point');
    expect(vaccinationPoint.document).toEqual('document');
    expect(vaccinationPoint.phone.phone).toEqual('00000000');
    expect(vaccinationPoint.location).toEqual(makeFixture().location);
  });

  it('should validate vaccination point object', async () => {
    const { sut } = makeSut();

    const testable = await sut.execute(makeFixture(null));

    expect(testable.isLeft()).toBeTruthy();
    expect(testable.value).toEqual(new InvalidVaccinationPoint('Name is required'));
  });

  it('should check if document is already in use', async () => {
    const { sut } = makeSut();

    const testable = await sut.execute(makeFixture());

    expect(testable.isLeft()).toBeTruthy();
    expect(testable.value).toEqual(new DocumentAlreadyInUse());
  });

  it('should check if coordinates are already in use', async () => {
    const { sut, fakeVaccinationPointsRepository } = makeSut();

    jest
      .spyOn(fakeVaccinationPointsRepository, 'findByDocument')
      .mockImplementation(() => Promise.resolve(right(null)));

    const testable = await sut.execute(makeFixture());

    expect(testable.isLeft()).toBeTruthy();
    expect(testable.value).toEqual(new LocationAlreadyInUse());
  });

  describe('validate infra errors', () => {
    it('should validate findByDocument', async () => {
      const { sut, fakeVaccinationPointsRepository } = makeSut();

      jest
        .spyOn(fakeVaccinationPointsRepository, 'findByDocument')
        .mockImplementation(() => Promise.resolve(left(new InfraError('Unexpected Error'))));

      const testable = await sut.execute(makeFixture());

      expect(testable.isLeft()).toBeTruthy();
      expect(testable.value).toEqual(new InfraError('Unexpected Error'));
    });

    it('should validate findByCoordinate', async () => {
      const { sut, fakeVaccinationPointsRepository } = makeSut();

      jest
        .spyOn(fakeVaccinationPointsRepository, 'findByDocument')
        .mockImplementation(() => Promise.resolve(right(null)));

      jest
        .spyOn(fakeVaccinationPointsRepository, 'findByCoordinate')
        .mockImplementation(() => Promise.resolve(left(new InfraError('Unexpected Error'))));

      const testable = await sut.execute(makeFixture());

      expect(testable.isLeft()).toBeTruthy();
      expect(testable.value).toEqual(new InfraError('Unexpected Error'));
    });

    it('should validate save', async () => {
      const { sut, fakeVaccinationPointsRepository } = makeSut();

      jest
        .spyOn(fakeVaccinationPointsRepository, 'findByDocument')
        .mockImplementation(() => Promise.resolve(right(null)));

      jest
        .spyOn(fakeVaccinationPointsRepository, 'findByCoordinate')
        .mockImplementation(() => Promise.resolve(right(null)));

      jest
        .spyOn(fakeVaccinationPointsRepository, 'save')
        .mockImplementation(() => Promise.resolve(left(new InfraError('Unexpected Error'))));

      const testable = await sut.execute(makeFixture());

      expect(testable.isLeft()).toBeTruthy();
      expect(testable.value).toEqual(new InfraError('Unexpected Error'));
    });
  });
});
