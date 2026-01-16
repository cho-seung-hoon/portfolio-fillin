package com.kosa.fillinv.member.repository;

import com.kosa.fillinv.member.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, String> {
    List<Profile> findByMemberIdIn(Collection<String> memberIds);
}
