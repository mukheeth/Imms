package com.insurance.percert.serviceImplementation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.insurance.percert.Repository.OrderRepository;
import com.insurance.percert.model.Order;
import com.insurance.percert.service.OrderService;

@Service
public class OrderServiceImplementation implements OrderService {
    private final OrderRepository orderRepository;

    @Autowired
    public OrderServiceImplementation(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // @Override
    // public List<Order> getOrdersByPatientUniqueId(String uniquePatientNumber) {
    // return orderRepository.findByPatient_CustomPatientId(uniquePatientNumber);
    // }

    @Override
    public Order getOrderById(Long orderId) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);
        if (optionalOrder.isPresent()) {
            return optionalOrder.get();
        } else {
            throw new RuntimeException("Order not found with id: " + orderId);
        }
    }

    @Override
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public Order updateOrder(Long orderId, Order orderDetails) {
        Order existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        existingOrder.setOrderDate(orderDetails.getOrderDate());
        existingOrder.setFromDateOfService(orderDetails.getFromDateOfService());
        existingOrder.setToDateOfService(orderDetails.getToDateOfService());
        existingOrder.setOrderType(orderDetails.getOrderType());
        existingOrder.setOrderDescription(orderDetails.getOrderDescription());
        existingOrder.setOrderPriority(orderDetails.getOrderPriority());
        existingOrder.setOrderIcdCode(orderDetails.getOrderIcdCode());
        existingOrder.setOrderCptCode(orderDetails.getOrderCptCode());
        existingOrder.setOrderJCode(orderDetails.getOrderJCode());
        existingOrder.setUnits(orderDetails.getUnits());
        existingOrder.setOrderStatus(orderDetails.getOrderStatus());
        existingOrder.setIcddrugType(orderDetails.getIcddrugType());
        existingOrder.setIcddrugamtdispensed(orderDetails.getIcddrugamtdispensed());
        existingOrder.setIcddrugamtdispensedType(orderDetails.getIcddrugamtdispensedType());
        existingOrder.setIcddrugdescription(orderDetails.getIcddrugdescription());
        existingOrder.setIcddrugunits(orderDetails.getIcddrugunits());
        existingOrder.setIcdnumberofchempresent(orderDetails.getIcdnumberofchempresent());
        existingOrder.setIcddrugname(orderDetails.getIcddrugname());
        existingOrder.setPrecertificationType(orderDetails.getPrecertificationType());

        //added extra code for allowing more than one drug data to add.
        existingOrder.setUniquepatientI(orderDetails.getUniquepatientI());
        existingOrder.setProviderNpiNumber(orderDetails.getProviderNpiNumber());
        existingOrder.setInsuranceId(orderDetails.getInsuranceId());
        return orderRepository.save(existingOrder);
    }

    @Override
    public void deleteOrder(Long orderId) {
        Order existingOrder = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        orderRepository.delete(existingOrder);
    }

    // @Override
    // public Order doesPatIdExist(String patId) {
    //     return orderRepository.findByUniquepatientI(patId);
    // }
@Override
    public List<Order> doesPatIdExist(String patId) {
        List<Order> orders = orderRepository.findByUniquepatientI(patId);
        return orders;
    }


    @Override
    public List<Order> getOrdersByProviderNpiNumber(String providerNpiNumber) {
        return orderRepository.findByProviderNpiNumber(providerNpiNumber);
    }


   @Override
    public List<Order> getOrdersByProviderName(String providerName) {
        if (providerName == null) return null;
        return orderRepository.findByProviderNameIgnoreCase(providerName.trim());
    }

@Override
    public Order updateOrderpartly(Long orderId, Order orderDetails) throws Exception {
        // Find the order by its ID
        Optional<Order> optionalOrder = orderRepository.findById(orderId);

        if (optionalOrder.isPresent()) {
            Order existingOrder = optionalOrder.get();

            // Update only the required fields
            if (orderDetails.getFromDateOfService() != null) {
                existingOrder.setFromDateOfService(orderDetails.getFromDateOfService());
            }
            if (orderDetails.getToDateOfService() != null) {
                existingOrder.setToDateOfService(orderDetails.getToDateOfService());
            }
            if (orderDetails.getOrderIcdCode() != null) {
                existingOrder.setOrderIcdCode(orderDetails.getOrderIcdCode());
            }
            if (orderDetails.getIcddrugname() != null) {
                existingOrder.setIcddrugname(orderDetails.getIcddrugname());
            }
            if (orderDetails.getIcddrugdescription() != null) {
                existingOrder.setIcddrugdescription(orderDetails.getIcddrugdescription());
            }
            if (orderDetails.getIcddrugamtdispensed() != null) {
                existingOrder.setIcddrugamtdispensed(orderDetails.getIcddrugamtdispensed());
            }

            if (orderDetails.getIcddrugamtdispensedType() != null) {
                existingOrder.setIcddrugamtdispensedType(orderDetails.getIcddrugamtdispensedType());
            }
            if (orderDetails.getIcdnumberofchempresent() != null) {
                existingOrder.setIcdnumberofchempresent(orderDetails.getIcdnumberofchempresent());
            }
            if (orderDetails.getIcddrugType() != null) {
                existingOrder.setIcddrugType(orderDetails.getIcddrugType());
            }
            if (orderDetails.getIcddrugunits() != null) {
                existingOrder.setIcddrugunits(orderDetails.getIcddrugunits());
            }
            if(orderDetails.getPrecertificationType()!=null){
                existingOrder.setPrecertificationType(orderDetails.getPrecertificationType());
            }
            if(orderDetails.getUniquepatientI()!=null){
                existingOrder.setUniquepatientI(orderDetails.getUniquepatientI());
            }
            if(orderDetails.getInsuranceId()!=null){
                existingOrder.setInsuranceId(orderDetails.getInsuranceId());
            }
            if(orderDetails.getProviderNpiNumber()!=null){
                existingOrder.setProviderNpiNumber(orderDetails.getProviderNpiNumber());
            }
            if(orderDetails.getProviderName()!=null){
                existingOrder.setProviderName(orderDetails.getProviderName());
            }

            // Save the updated order
            return orderRepository.save(existingOrder);
        } else {
            // If the order is not found, you can handle it as an error or return null
            throw new Exception("Order not found with ID: " + orderId);
        }
    }

    @Override
    public Order deleteOrderpartly(Long orderId) throws Exception {
        // Find the order by its ID
        Optional<Order> optionalOrder = orderRepository.findById(orderId);

        if (optionalOrder.isPresent()) {
            Order existingOrder = optionalOrder.get();

           existingOrder.setDeletedStatus(true);
           
            // Save the updated order
            return orderRepository.save(existingOrder);
        } else {
            // If the order is not found, you can handle it as an error or return null
            throw new Exception("Order not found with ID: " + orderId);
        }
    }


    


    @Override
    public List<Order> findByIcdDrugName(String icdDrugName) {
        return orderRepository.findByIcddrugname(icdDrugName);
    }

    @Override
    public List<Order> searchByIcdDrugName(String term) {
        return orderRepository.findByIcddrugnameContainingIgnoreCase(term);
    }

}
