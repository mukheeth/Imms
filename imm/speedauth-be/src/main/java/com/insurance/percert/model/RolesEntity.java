package com.insurance.percert.model;
import java.util.ArrayList;
import java.util.List;
// import com.example.internalservice.Subscription.SubscriptionEntity;
// import com.example.internalservice.UserConfig.User.UserEntity;
import com.insurance.percert.model.UserEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@ToString
@Data
@Entity(name = "roles_master")
public class RolesEntity {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String role_name;
    private String role_desc;
    private int resume_read;
    private int resume_write;
    private int job_desc_read;
    private int job_desc_write;
    private int admin_access;

    @JsonIgnore
    @OneToMany(mappedBy = "role_type" , cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<UserEntity> users = new ArrayList<>();
 

}
