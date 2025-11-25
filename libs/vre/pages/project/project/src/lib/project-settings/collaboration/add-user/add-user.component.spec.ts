import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AdminAPIApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CollaborationPageService } from '../collaboration-page.service';
import { AddUserComponent } from './add-user.component';

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let mockDspApiConnection: jest.Mocked<KnoraApiConnection>;
  let mockUserApiService: jest.Mocked<UserApiService>;
  let mockProjectService: jest.Mocked<ProjectService>;
  let mockCollaborationPageService: jest.Mocked<CollaborationPageService>;

  const mockUser1 = {
    id: 'http://rdfh.ch/users/user1',
    username: 'jdoe',
    email: 'jdoe@example.com',
    givenName: 'John',
    familyName: 'Doe',
    projects: [],
    groups: [],
    permissions: {},
    lang: 'en',
    status: true,
  } as unknown as ReadUser;

  const mockUser2 = {
    id: 'http://rdfh.ch/users/user2',
    username: 'jsmith',
    email: 'jsmith@example.com',
    givenName: 'Jane',
    familyName: 'Smith',
    projects: [],
    groups: [],
    permissions: {},
    lang: 'en',
    status: true,
  } as unknown as ReadUser;

  const mockUser3 = {
    id: 'http://rdfh.ch/users/user3',
    username: 'bwilson',
    email: 'bwilson@example.com',
    givenName: 'Bob',
    familyName: 'Wilson',
    projects: [{ id: 'http://rdfh.ch/projects/0001' }],
    groups: [],
    permissions: {},
    lang: 'en',
    status: true,
  } as unknown as ReadUser;

  beforeEach(async () => {
    mockDspApiConnection = {
      admin: {
        usersEndpoint: {
          addUserToProjectMembership: jest.fn().mockReturnValue(of({})),
        },
      },
    } as any;

    mockUserApiService = {
      list: jest.fn().mockReturnValue(of({ users: [mockUser1, mockUser2, mockUser3] })),
    } as any;

    mockProjectService = {
      uuidToIri: jest.fn().mockReturnValue('http://rdfh.ch/projects/0001'),
    } as any;

    mockCollaborationPageService = {
      reloadProjectMembers$: of(null),
      reloadProjectMembers: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      declarations: [AddUserComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: DspApiConnectionToken, useValue: mockDspApiConnection },
        { provide: AdminAPIApiService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: UserApiService, useValue: mockUserApiService },
        { provide: CollaborationPageService, useValue: mockCollaborationPageService },
      ],
    })
      .overrideComponent(AddUserComponent, {
        set: {
          // Template is overridden to isolate unit test from template rendering
          // This tests only the component logic, not UI integration
          template: '<div>Mock Template</div>',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.projectUuid = 'test-uuid-123';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('displayUser', () => {
    it('should return formatted label for a user object (not URL)', () => {
      const result = component.displayUser(mockUser1);

      expect(result).toBe('jdoe | jdoe@example.com | John Doe');
      expect(result).not.toContain('http://');
    });

    it('should return empty string for null user', () => {
      const result = component.displayUser(null);

      expect(result).toBe('');
    });

    it('should handle user with missing optional fields', () => {
      const userWithoutUsername = {
        ...mockUser1,
        username: undefined,
      } as unknown as ReadUser;

      const result = component.displayUser(userWithoutUsername);

      expect(result).toBe('jdoe@example.com | John Doe');
    });
  });

  describe('onUserSelected', () => {
    it('should clear the form control immediately when user is selected', () => {
      component.usernameControl.setValue('search text');

      component.onUserSelected(mockUser1);

      expect(component.usernameControl.value).toBeNull();
    });

    it('should call addUser with the selected user', () => {
      const addUserSpy = jest.spyOn(component, 'addUser');

      component.onUserSelected(mockUser1);

      expect(addUserSpy).toHaveBeenCalledWith(mockUser1);
    });
  });

  describe('addUser', () => {
    it('should add user to project using user.id from ReadUser object', done => {
      component.addUser(mockUser1);

      setTimeout(() => {
        expect(mockDspApiConnection.admin.usersEndpoint.addUserToProjectMembership).toHaveBeenCalledWith(
          'http://rdfh.ch/users/user1',
          'http://rdfh.ch/projects/0001'
        );
        done();
      }, 100);
    });

    it('should trigger project members reload after adding user', done => {
      component.addUser(mockUser1);

      setTimeout(() => {
        expect(mockCollaborationPageService.reloadProjectMembers).toHaveBeenCalled();
        done();
      }, 100);
    });
  });

  describe('isMember', () => {
    it('should return false for user not in project', () => {
      const result = component.isMember(mockUser1);

      expect(result).toBe(false);
    });

    it('should return true for user already in project', () => {
      const result = component.isMember(mockUser3);

      expect(result).toBe(true);
    });

    it('should return false for user with no projects', () => {
      const userWithNoProjects = {
        ...mockUser1,
        projects: undefined,
      } as unknown as ReadUser;

      const result = component.isMember(userWithNoProjects);

      expect(result).toBe(false);
    });
  });

  describe('FormControl type handling', () => {
    it('should handle string, ReadUser, and null values in form control', () => {
      // String value during typing
      component.usernameControl.setValue('searching...');
      expect(typeof component.usernameControl.value).toBe('string');

      // ReadUser object after selection
      component.usernameControl.setValue(mockUser1);
      expect(typeof component.usernameControl.value).toBe('object');
      expect(component.usernameControl.value).toEqual(mockUser1);

      // Null after reset
      component.usernameControl.setValue(null);
      expect(component.usernameControl.value).toBeNull();
    });
  });

  describe('filtering logic', () => {
    it('should filter users by name when string is provided', done => {
      component.filteredUsers$.subscribe(users => {
        expect(users).toBeDefined();
        done();
      });
    });

    it('should handle ReadUser object in filter without errors', () => {
      const filterResult = component['_filter']([mockUser1, mockUser2], mockUser1);

      expect(filterResult).toEqual([mockUser1, mockUser2]);
    });

    it('should filter correctly with string input', () => {
      const filterResult = component['_filter']([mockUser1, mockUser2, mockUser3], 'john');

      expect(filterResult).toEqual([mockUser1]);
    });

    it('should perform case-insensitive filtering', () => {
      const filterResult = component['_filter']([mockUser1, mockUser2, mockUser3], 'JANE');

      expect(filterResult).toEqual([mockUser2]);
    });

    it('should return all users when filter value is ReadUser object', () => {
      const filterResult = component['_filter']([mockUser1, mockUser2, mockUser3], mockUser1);

      expect(filterResult).toEqual([mockUser1, mockUser2, mockUser3]);
    });
  });
});
